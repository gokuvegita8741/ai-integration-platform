from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import Any, List, Optional
import json
from app.db import prisma
from app.api import deps
from app.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    ChatMessage,
    ChatMessageVersion,
    ChatMessageWithVersions,
    MessageSender, 
    ChatCreateRequest, 
    ChatCreateResponse,
    ChatRenameRequest,
    ChatListItem,
    ChatDetailResponse,
    SwitchVersionRequest,
    RegenerateResponse
)
from app.services.llm import process_chat_request, process_chat_request_stream
from app.services.activity import ActivityService
from prisma import models

router = APIRouter()


# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

async def get_next_sequence(chat_id: str) -> int:
    """Get the next sequence number for a chat."""
    last_msg = await prisma.chatmessage.find_first(
        where={'chatId': chat_id},
        order={'sequence': 'desc'}
    )
    return (last_msg.sequence + 1) if last_msg else 0


def resolve_message_content(msg: models.ChatMessage) -> str:
    """Resolve content from active version or legacy message field."""
    if msg.activeVersion and hasattr(msg.activeVersion, 'content'):
        return msg.activeVersion.content
    return msg.message


def build_message_with_versions(msg: models.ChatMessage) -> ChatMessageWithVersions:
    """Convert a Prisma ChatMessage to ChatMessageWithVersions schema."""
    versions = []
    active_version_number = None
    
    if msg.versions:
        for v in msg.versions:
            versions.append(ChatMessageVersion(
                id=v.id,
                versionNumber=v.versionNumber,
                content=v.content,
                createdAt=v.createdAt,
                model=v.model
            ))
        # Find active version number
        if msg.activeVersionId:
            for v in msg.versions:
                if v.id == msg.activeVersionId:
                    active_version_number = v.versionNumber
                    break
    
    return ChatMessageWithVersions(
        id=msg.id,
        chatId=msg.chatId,
        sender=msg.sender,
        sequence=msg.sequence,
        isActive=msg.isActive,
        parentVersionId=getattr(msg, 'parentVersionId', None),
        content=resolve_message_content(msg),
        versions=versions,
        activeVersionNumber=active_version_number,
        totalVersions=len(versions) if versions else 1,
        createdAt=msg.createdAt
    )


async def ensure_assistant_version(msg: models.ChatMessage) -> str:
    """Ensure an assistant message has an active version row and return its active version id."""
    if msg.sender != "assistant":
        raise ValueError("Only assistant messages can have response versions")

    if msg.activeVersionId:
        return msg.activeVersionId

    versions = getattr(msg, 'versions', None) or []
    if versions:
        first_version = sorted(versions, key=lambda v: v.versionNumber)[0]
        await prisma.chatmessage.update(
            where={'id': msg.id},
            data={'activeVersionId': first_version.id, 'message': first_version.content}
        )
        return first_version.id

    version = await prisma.chatmessageversion.create(
        data={
            'messageId': msg.id,
            'versionNumber': 1,
            'content': msg.message,
            'model': None
        }
    )
    await prisma.chatmessage.update(
        where={'id': msg.id},
        data={'activeVersionId': version.id}
    )
    return version.id


async def get_current_parent_version_id(chat_id: str) -> Optional[str]:
    """Return the active assistant version that new messages should branch from."""
    last_assistant = await prisma.chatmessage.find_first(
        where={'chatId': chat_id, 'sender': 'assistant', 'isActive': True},
        order={'sequence': 'desc'},
        include={
            'versions': {'order_by': {'versionNumber': 'asc'}},
            'activeVersion': True
        }
    )
    if not last_assistant:
        return None
    return await ensure_assistant_version(last_assistant)


async def rebuild_active_conversation(chat_id: str) -> list[ChatMessageWithVersions]:
    """
    Recompute the visible conversation path from selected assistant versions.
    Messages whose parent assistant version is not on the selected path are hidden.
    """
    messages_db = await prisma.chatmessage.find_many(
        where={'chatId': chat_id},
        order={'sequence': 'asc'},
        include={
            'versions': {'order_by': {'versionNumber': 'asc'}},
            'activeVersion': True
        }
    )

    visible_version_ids = set()
    visible_message_ids = []

    for msg in messages_db:
        parent_version_id = getattr(msg, 'parentVersionId', None)
        is_visible = parent_version_id is None or parent_version_id in visible_version_ids

        if is_visible:
            visible_message_ids.append(msg.id)
            if msg.sender == "assistant":
                visible_version_ids.add(await ensure_assistant_version(msg))

    await prisma.chatmessage.update_many(
        where={'chatId': chat_id},
        data={'isActive': False}
    )

    if visible_message_ids:
        await prisma.chatmessage.update_many(
            where={'id': {'in': visible_message_ids}},
            data={'isActive': True}
        )

    active_messages = await prisma.chatmessage.find_many(
        where={'chatId': chat_id, 'isActive': True},
        order={'sequence': 'asc'},
        include={
            'versions': {'order_by': {'versionNumber': 'asc'}},
            'activeVersion': True
        }
    )

    return [build_message_with_versions(msg) for msg in active_messages]


async def get_chat_context(chat_id: str, up_to_sequence: Optional[int] = None, limit: int = 10) -> list[dict]:
    """
    Get conversation context for LLM.
    If up_to_sequence is provided, only includes active messages up to that sequence.
    """
    where_clause = {'chatId': chat_id, 'isActive': True}
    if up_to_sequence is not None:
        where_clause['sequence'] = {'lt': up_to_sequence}
    
    messages = await prisma.chatmessage.find_many(
        where=where_clause,
        order={'sequence': 'desc'},
        take=limit,
        include={'activeVersion': True}
    )
    messages.reverse()
    
    context = []
    for msg in messages:
        role = "user" if msg.sender == "user" else "assistant"
        content = resolve_message_content(msg)
        context.append({"role": role, "content": content})
    
    return context


# ---------------------------------------------------------------------------
# Chat CRUD Endpoints
# ---------------------------------------------------------------------------

@router.post("/create", response_model=ChatCreateResponse)
async def create_chat(
    chat_in: ChatCreateRequest,
    workspace_id: Optional[str] = None,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Create a new blank chat session.
    Optionally assign to a workspace via query param.
    """
    chatbot = await prisma.userchatbot.find_unique(where={'userId': current_user.id})
    if not chatbot:
        chatbot = await prisma.userchatbot.create(data={'userId': current_user.id})

    chat_data = {
        'userId': current_user.id,
        'chatbotId': chatbot.id,
        'source': chat_in.source,
        'websiteDomain': chat_in.websiteDomain,
        'pagePath': chat_in.pagePath,
        'projectName': chat_in.projectName,
        'name': "New Chat",
    }
    if workspace_id:
        chat_data['workspaceId'] = workspace_id

    chat = await prisma.chat.create(data=chat_data)

    # Log activity
    await ActivityService.log_activity(
        user_id=current_user.id,
        action="chat_created",
        entity_type="chat",
        entity_id=chat.id,
        entity_name=chat.name,
        workspace_id=workspace_id,
    )

    return ChatCreateResponse(chatId=chat.id, name=chat.name)


@router.put("/{chat_id}/rename")
async def rename_chat(
    chat_id: str,
    chat_in: ChatRenameRequest,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Rename a chat.
    """
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await prisma.chat.update(
        where={'id': chat_id},
        data={'name': chat_in.name}
    )
    
    return {"success": True, "chatId": chat_id, "message": f"Chat renamed to {chat_in.name} successfully"}


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Delete a chat and all its messages.
    """
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    chat_name = chat.name
    workspace_id = chat.workspaceId

    # Cascade delete is now configured in schema, so just delete the chat
    await prisma.chat.delete(where={'id': chat_id})

    # Log activity
    await ActivityService.log_activity(
        user_id=current_user.id,
        action="chat_deleted",
        entity_type="chat",
        entity_id=chat_id,
        entity_name=chat_name,
        workspace_id=workspace_id,
    )

    return {"success": True, "chatId": chat_id, "message": "Chat deleted successfully"}


@router.get("/list", response_model=List[ChatListItem])
async def list_chats(
    workspace_id: Optional[str] = None,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Get all chats for the current user.
    Optionally filter by workspace_id.
    """
    where_clause: dict = {'userId': current_user.id}
    if workspace_id:
        where_clause['workspaceId'] = workspace_id

    chats = await prisma.chat.find_many(
        where=where_clause,
        order={'createdAt': 'desc'}
    )

    return [
        ChatListItem(id=chat.id, name=chat.name, createdAt=chat.createdAt)
        for chat in chats
    ]


@router.patch("/{chat_id}/pin")
async def pin_chat(
    chat_id: str,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Toggle pin status for a chat.
    """
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated = await prisma.chat.update(
        where={'id': chat_id},
        data={'isPinned': not chat.isPinned}
    )

    return {"success": True, "chatId": chat_id, "isPinned": updated.isPinned}


@router.patch("/{chat_id}/archive")
async def archive_chat(
    chat_id: str,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Toggle archive status for a chat.
    """
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated = await prisma.chat.update(
        where={'id': chat_id},
        data={'isArchived': not chat.isArchived}
    )

    return {"success": True, "chatId": chat_id, "isArchived": updated.isArchived}


@router.get("/{chat_id}", response_model=ChatDetailResponse)
async def get_chat(
    chat_id: str,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Get a chat with all its ACTIVE messages (with version info).
    """
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get only active messages, ordered by sequence
    messages_db = await prisma.chatmessage.find_many(
        where={'chatId': chat_id, 'isActive': True},
        order={'sequence': 'asc'},
        include={
            'versions': {'order_by': {'versionNumber': 'asc'}},
            'activeVersion': True
        }
    )
    
    messages = [build_message_with_versions(msg) for msg in messages_db]
    
    return ChatDetailResponse(
        id=chat.id,
        name=chat.name,
        createdAt=chat.createdAt,
        messages=messages
    )


# ---------------------------------------------------------------------------
# Message Endpoints
# ---------------------------------------------------------------------------

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    chat_in: ChatRequest,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Send a message to an EXISTING chat (non-streaming).
    """
    chat_id = chat_in.chatId
    
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    
    # Check for auto-naming
    message_count = await prisma.chatmessage.count(where={'chatId': chat_id, 'isActive': True})
    updated_name = None
    
    if message_count == 0:
        new_name = (chat_in.message[:37] + '...') if len(chat_in.message) > 40 else chat_in.message
        await prisma.chat.update(
            where={'id': chat_id},
            data={'name': new_name}
        )
        updated_name = new_name

    # Get next sequence
    next_seq = await get_next_sequence(chat_id)
    parent_version_id = await get_current_parent_version_id(chat_id)
    
    # Save User Message
    await prisma.chatmessage.create(
        data={
            'chatId': chat_id,
            'sender': MessageSender.user,
            'message': chat_in.message,
            'sequence': next_seq,
            'isActive': True,
            'parentVersionId': parent_version_id
        }
    )
    
    # Get context
    previous_messages = await get_chat_context(chat_id, up_to_sequence=next_seq + 1, limit=10)
    
    # Call LLM
    assistant_reply = await process_chat_request(chat_in.message, previous_messages[:-1])
    
    # Save Assistant Message
    assistant_seq = next_seq + 1
    assistant_msg = await prisma.chatmessage.create(
        data={
            'chatId': chat_id,
            'sender': MessageSender.assistant,
            'message': assistant_reply,
            'sequence': assistant_seq,
            'isActive': True,
            'parentVersionId': parent_version_id
        }
    )
    assistant_version = await prisma.chatmessageversion.create(
        data={
            'messageId': assistant_msg.id,
            'versionNumber': 1,
            'content': assistant_reply,
            'model': None
        }
    )
    assistant_msg = await prisma.chatmessage.update(
        where={'id': assistant_msg.id},
        data={'activeVersionId': assistant_version.id}
    )
    
    return ChatResponse(
        chatId=chat_id,
        message=ChatMessage(
            id=assistant_msg.id,
            chatId=assistant_msg.chatId,
            sender=assistant_msg.sender,
            message=assistant_msg.message,
            createdAt=assistant_msg.createdAt
        ),
        name=updated_name
    )


@router.post("/stream")
async def stream_chat_message(
    chat_in: ChatRequest,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Send a message and stream the response via SSE.
    """
    chat_id = chat_in.chatId
    
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check for auto-naming
    message_count = await prisma.chatmessage.count(where={'chatId': chat_id, 'isActive': True})
    updated_name = None
    
    if message_count == 0:
        new_name = (chat_in.message[:37] + '...') if len(chat_in.message) > 40 else chat_in.message
        await prisma.chat.update(
            where={'id': chat_id},
            data={'name': new_name}
        )
        updated_name = new_name

    # Get next sequence
    next_seq = await get_next_sequence(chat_id)
    parent_version_id = await get_current_parent_version_id(chat_id)
    
    # Save User Message
    user_msg = await prisma.chatmessage.create(
        data={
            'chatId': chat_id,
            'sender': MessageSender.user,
            'message': chat_in.message,
            'sequence': next_seq,
            'isActive': True,
            'parentVersionId': parent_version_id
        }
    )
    
    # Get context (excluding the just-inserted user message for LLM context)
    previous_messages = await get_chat_context(chat_id, up_to_sequence=next_seq, limit=10)

    async def event_generator():
        full_response = []
        
        if updated_name:
            yield f"data: {{\"type\": \"name\", \"name\": \"{updated_name}\"}}\n\n"
        
        async for chunk in process_chat_request_stream(chat_in.message, previous_messages):
            full_response.append(chunk)
            payload = {
                "type":"chunk",
                "content":chunk
            }
            yield f"data: {json.dumps(payload)}\n\n"
        
        # Save complete response
        complete_message = "".join(full_response)
        assistant_seq = next_seq + 1
        assistant_msg = await prisma.chatmessage.create(
            data={
                'chatId': chat_id,
                'sender': MessageSender.assistant,
                'message': complete_message,
                'sequence': assistant_seq,
                'isActive': True,
                'parentVersionId': parent_version_id
            }
        )
        assistant_version = await prisma.chatmessageversion.create(
            data={
                'messageId': assistant_msg.id,
                'versionNumber': 1,
                'content': complete_message,
                'model': None
            }
        )
        assistant_msg = await prisma.chatmessage.update(
            where={'id': assistant_msg.id},
            data={'activeVersionId': assistant_version.id}
        )
        
        yield f"data: {{\"type\": \"done\", \"messageId\": \"{assistant_msg.id}\"}}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


# ---------------------------------------------------------------------------
# Regenerate & Version Switching Endpoints
# ---------------------------------------------------------------------------

@router.post("/messages/{message_id}/regenerate")
async def regenerate_message(
    message_id: str,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Regenerate an assistant message and stream the new version.
    If regenerating a mid-conversation message, deactivates all subsequent messages.
    """
    # 1. Get the message with its chat
    message = await prisma.chatmessage.find_unique(
        where={'id': message_id},
        include={
            'chat': True,
            'versions': {'order_by': {'versionNumber': 'desc'}, 'take': 1}
        }
    )
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    if not message.chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if message.chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if message.sender != "assistant":
        raise HTTPException(status_code=400, detail="Can only regenerate assistant messages")
    
    chat_id = message.chatId
    target_sequence = message.sequence
    
    # 2. Deactivate all messages after this one
    truncated = await prisma.chatmessage.update_many(
        where={
            'chatId': chat_id,
            'sequence': {'gt': target_sequence},
            'isActive': True
        },
        data={'isActive': False}
    )
    truncated_count = truncated if isinstance(truncated, int) else getattr(truncated, 'count', 0)
    
    # 3. Get next version number
    next_version = 1
    if message.versions and len(message.versions) > 0:
        next_version = message.versions[0].versionNumber + 1
    elif message.message:
        # Migrate legacy message to version 1 first
        await prisma.chatmessageversion.create(
            data={
                'messageId': message_id,
                'versionNumber': 1,
                'content': message.message,
                'model': None
            }
        )
        next_version = 2
    
    # 4. Get context (messages before this one)
    context = await get_chat_context(chat_id, up_to_sequence=target_sequence, limit=10)
    
    # 5. Stream the regeneration
    async def event_generator():
        full_response = []
        
        # Get the last user message as the prompt
        last_user_msg = None
        for ctx in reversed(context):
            if ctx['role'] == 'user':
                last_user_msg = ctx['content']
                break
        
        if not last_user_msg:
            last_user_msg = "Continue the conversation."
        
        # Remove the last message from context if it's the user prompt
        llm_context = context[:-1] if context else []
        
        async for chunk in process_chat_request_stream(last_user_msg, llm_context):
            full_response.append(chunk)
            escaped_chunk = chunk.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
            yield f"data: {{\"type\": \"chunk\", \"content\": \"{escaped_chunk}\"}}\n\n"
        
        # Save new version
        complete_content = "".join(full_response)
        new_version = await prisma.chatmessageversion.create(
            data={
                'messageId': message_id,
                'versionNumber': next_version,
                'content': complete_content,
                'model': 'gemma-3-27b-it'
            }
        )
        
        # Update active version
        await prisma.chatmessage.update(
            where={'id': message_id},
            data={'activeVersionId': new_version.id, 'message': complete_content}
        )
        
        messages = await rebuild_active_conversation(chat_id)

        # Get updated message with all versions
        updated_msg = await prisma.chatmessage.find_unique(
            where={'id': message_id},
            include={
                'versions': {'order_by': {'versionNumber': 'asc'}},
                'activeVersion': True
            }
        )
        
        import json
        msg_data = build_message_with_versions(updated_msg)
        messages_data = [m.model_dump() for m in messages]
        yield f"data: {{\"type\": \"done\", \"message\": {json.dumps(msg_data.model_dump(), default=str)}, \"messages\": {json.dumps(messages_data, default=str)}, \"truncatedCount\": {truncated_count}}}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.patch("/messages/{message_id}/switch-version")
async def switch_message_version(
    message_id: str,
    request: SwitchVersionRequest,
    current_user: models.User = Depends(deps.get_current_user)
) -> RegenerateResponse:
    """
    Switch to a different version of an assistant message.
    Rebuilds the active conversation path for the selected branch.
    """
    # 1. Get message with chat
    message = await prisma.chatmessage.find_unique(
        where={'id': message_id},
        include={'chat': True, 'versions': True}
    )
    
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    if not message.chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if message.chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if message.sender != "assistant":
        raise HTTPException(status_code=400, detail="Can only switch versions for assistant messages")
    
    # 2. Find the requested version
    target_version = None
    for v in (message.versions or []):
        if v.versionNumber == request.versionNumber:
            target_version = v
            break
    
    if not target_version:
        raise HTTPException(status_code=404, detail=f"Version {request.versionNumber} not found")
    
    # 3. Update active version
    await prisma.chatmessage.update(
        where={'id': message_id},
        data={'activeVersionId': target_version.id}
    )

    messages = await rebuild_active_conversation(message.chatId)
    
    # 4. Fetch updated message
    updated_msg = await prisma.chatmessage.find_unique(
        where={'id': message_id},
        include={
            'versions': {'order_by': {'versionNumber': 'asc'}},
            'activeVersion': True
        }
    )
    
    return RegenerateResponse(
        chatId=message.chatId,
        message=build_message_with_versions(updated_msg),
        messages=messages,
        truncatedCount=0
    )
