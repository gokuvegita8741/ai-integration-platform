from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import Any, List
from app.db import prisma
from app.api import deps
from app.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    ChatMessage, 
    MessageSender, 
    ChatCreateRequest, 
    ChatCreateResponse,
    ChatRenameRequest,
    ChatListItem,
    ChatDetailResponse
)
from app.services.llm import process_chat_request, process_chat_request_stream
from prisma import models

router = APIRouter()

@router.post("/create", response_model=ChatCreateResponse)
async def create_chat(
    chat_in: ChatCreateRequest,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Create a new blank chat session.
    """
    # 1. Ensure UserChatbot exists
    chatbot = await prisma.userchatbot.find_unique(where={'userId': current_user.id})
    if not chatbot:
        chatbot = await prisma.userchatbot.create(data={'userId': current_user.id})
        
    # 2. Create Chat
    chat = await prisma.chat.create(
        data={
            'userId': current_user.id,
            'chatbotId': chatbot.id,
            'source': chat_in.source,
            'websiteDomain': chat_in.websiteDomain,
            'pagePath': chat_in.pagePath,
            'projectName': chat_in.projectName,
            'name': "New Chat" 
        }
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
    # Verify ownership
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    await prisma.chat.update(
        where={'id': chat_id},
        data={'name': chat_in.name}
    )
    
    return {"success": True,"chatId": chat_id,"message": "Chat renamed to {} successfully".format(chat_in.name)}

@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Delete a chat and all its messages.
    """
    # Verify ownership
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Delete (Cascading delete handles messages if configured, but let's be explicit if needed or rely on relation)
    # Prisma relations usually don't cascade automatically in client unless defined in schema @relation(onDelete: Cascade)
    # Since we didn't add onDelete: Cascade, we should delete messages first
    await prisma.chatmessage.delete_many(where={'chatId': chat_id})
    await prisma.chat.delete(where={'id': chat_id})
    
    return {"success": True,"chatId": chat_id,"message": "Chat deleted successfully"}


@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    chat_in: ChatRequest,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Send a message to an EXISTING chat.
    Updates chat name if it's the first message.
    """
    
    chat_id = chat_in.chatId
    
    # 1. Verify Chat Exists & Ownership
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    
    # 2. Check for auto-naming (if 0 messages so far)
    message_count = await prisma.chatmessage.count(where={'chatId': chat_id})
    updated_name = None
    
    if message_count == 0:
        # Truncate to 40 chars
        new_name = (chat_in.message[:37] + '...') if len(chat_in.message) > 40 else chat_in.message
        await prisma.chat.update(
            where={'id': chat_id},
            data={'name': new_name}
        )
        updated_name = new_name

    # 3. Save User Message
    await prisma.chatmessage.create(
        data={
            'chatId': chat_id,
            'sender': MessageSender.user,
            'message': chat_in.message
        }
    )
    
    # 4. Fetch Chat Context (Last 5 messages)
    previous_messages_db = await prisma.chatmessage.find_many(
        where={'chatId': chat_id},
        take=5, 
        skip=1, # Skip the message we *just* inserted (Step 3)
        order={'createdAt': 'desc'}
    )
    
    previous_messages_db.reverse()
    
    previous_messages = []
    for msg in previous_messages_db:
        role = "user" if msg.sender == "user" else "assistant"
        previous_messages.append({"role": role, "content": msg.message})

    # 5. Call LLM with Context
    assistant_reply = await process_chat_request(chat_in.message, previous_messages)
    
    # 6. Save Assistant Message
    assistant_msg = await prisma.chatmessage.create(
        data={
            'chatId': chat_id,
            'sender': MessageSender.assistant,
            'message': assistant_reply
        }
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


@router.get("/list", response_model=List[ChatListItem])
async def list_chats(
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Get all chats for the current user.
    """
    chats = await prisma.chat.find_many(
        where={'userId': current_user.id},
        order={'createdAt': 'desc'}
    )
    
    return [
        ChatListItem(id=chat.id, name=chat.name, createdAt=chat.createdAt)
        for chat in chats
    ]


@router.get("/{chat_id}", response_model=ChatDetailResponse)
async def get_chat(
    chat_id: str,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Get a chat with all its messages.
    """
    chat = await prisma.chat.find_unique(
        where={'id': chat_id},
        include={'messages': {'order_by': {'createdAt': 'asc'}}}
    )
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    messages = [
        ChatMessage(
            id=msg.id,
            chatId=msg.chatId,
            sender=msg.sender,
            message=msg.message,
            createdAt=msg.createdAt
        )
        for msg in (chat.messages or [])
    ]
    
    return ChatDetailResponse(
        id=chat.id,
        name=chat.name,
        createdAt=chat.createdAt,
        messages=messages
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
    
    # 1. Verify Chat Exists & Ownership
    chat = await prisma.chat.find_unique(where={'id': chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # 2. Check for auto-naming
    message_count = await prisma.chatmessage.count(where={'chatId': chat_id})
    updated_name = None
    
    if message_count == 0:
        new_name = (chat_in.message[:37] + '...') if len(chat_in.message) > 40 else chat_in.message
        await prisma.chat.update(
            where={'id': chat_id},
            data={'name': new_name}
        )
        updated_name = new_name

    # 3. Save User Message
    await prisma.chatmessage.create(
        data={
            'chatId': chat_id,
            'sender': MessageSender.user,
            'message': chat_in.message
        }
    )
    
    # 4. Fetch Chat Context
    previous_messages_db = await prisma.chatmessage.find_many(
        where={'chatId': chat_id},
        take=10,
        skip=1,
        order={'createdAt': 'desc'}
    )
    previous_messages_db.reverse()
    
    previous_messages = []
    for msg in previous_messages_db:
        role = "user" if msg.sender == "user" else "assistant"
        previous_messages.append({"role": role, "content": msg.message})

    # 5. Stream response
    async def event_generator():
        full_response = []
        
        # Send updated name if applicable
        if updated_name:
            yield f"data: {{\"type\": \"name\", \"name\": \"{updated_name}\"}}\n\n"
        
        async for chunk in process_chat_request_stream(chat_in.message, previous_messages):
            full_response.append(chunk)
            # Escape special characters for JSON
            escaped_chunk = chunk.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
            yield f"data: {{\"type\": \"chunk\", \"content\": \"{escaped_chunk}\"}}\n\n"
        
        # Save complete response
        complete_message = "".join(full_response)
        assistant_msg = await prisma.chatmessage.create(
            data={
                'chatId': chat_id,
                'sender': MessageSender.assistant,
                'message': complete_message
            }
        )
        
        # Send completion event with message ID
        yield f"data: {{\"type\": \"done\", \"messageId\": \"{assistant_msg.id}\"}}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
