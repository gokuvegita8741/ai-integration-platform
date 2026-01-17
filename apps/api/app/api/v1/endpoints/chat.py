from fastapi import APIRouter, Depends, HTTPException
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
    ChatRenameRequest
)
from app.services.llm import process_chat_request
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
    
    return {"success": True}

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
    
    return {"success": True}


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
    # We just inserted the user message, so it will be included in the top 5 desc.
    # Logic note: previous_messages_db includes the message we just inserted at index 0 (desc).
    # The requirement says: "Context: Last 5 messages... Append current user message at the end".
    #
    # Wait, if we fetch AFTER creating the message, the "current user message" is inside `previous_messages_db[0]`.
    #
    # Let's adjust slightly for safety to match the prompt rules specifically: "Append the current user message at the end".
    # If we fetch including the current message, we might duplicate it if we also append it. 
    # BUT, the robust way is: 
    # Fetch EXISTING messages (excluding current). 
    # The current message is `chat_in.message`.
    #
    # Actually, simpler: 
    # Fetch ALL last 5 (including the one we just saved).
    # Then just send `previous_messages_db` to LLM Service, but `process_chat_request` logic appends `message` manually.
    # Ah, `process_chat_request` takes `message` AND `previous_messages`.
    # So we should fetch context *excluding* the one we just saved??
    # Or just fetch top 6, ignore top 1?
    #
    # Let's refine: 
    # The requirement says "Fetch last 5... Then append current user message". 
    # The "Last 5" usually means "Previous history capable of being context".
    # Since we SAVED the current message already (Step 3), finding recent messages will include it.
    #
    # Let's fetch the messages, filter out the one we just created (by ID or assumption it is top 1), 
    # OR change Step 3 to be AFTER context fetch? (But requirement says "Save user message... then call LLM").
    #
    # Let's use `skip=1` in find_many to skip the just-inserted message?
    # Or simpler: Fetch limit 6. Filter.
    #
    # Actually, `process_chat_request` in `llm.py` logic:
    #   messages.extend(previous_messages)
    #   messages.append({"role": "user", "content": message})
    #
    # So `previous_messages` MUST NOT include the current message.
    
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
