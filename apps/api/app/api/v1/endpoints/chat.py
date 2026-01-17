from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from app.db import prisma
from app.api import deps
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage, MessageSender
from app.services.llm import process_chat_request
from prisma import models

router = APIRouter()

@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    chat_in: ChatRequest,
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Send a message to the chatbot and get a response.
    Create a new Chat session if chatId is not provided.
    """
    
    # 1. Ensure UserChatbot exists
    chatbot = await prisma.userchatbot.find_unique(where={'userId': current_user.id})
    if not chatbot:
        chatbot = await prisma.userchatbot.create(data={'userId': current_user.id})
    
    # 2. Get or Create Chat
    chat_id = chat_in.chatId
    
    if chat_id:
        # Verify ownership
        chat = await prisma.chat.find_unique(where={'id': chat_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        if chat.userId != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    else:
        # Create new chat
        chat = await prisma.chat.create(
            data={
                'userId': current_user.id,
                'chatbotId': chatbot.id,
                'source': chat_in.source,
                'websiteDomain': chat_in.websiteDomain,
                'pagePath': chat_in.pagePath,
                'projectName': chat_in.projectName,
            }
        )
        chat_id = chat.id
    
    # 3. Save User Message
    await prisma.chatmessage.create(
        data={
            'chatId': chat_id,
            'sender': MessageSender.user,
            'message': chat_in.message
        }
    )
    
    # 4. Call LLM
    assistant_reply = await process_chat_request(chat_in.message, chat_in.imageUrl)
    
    # 5. Save Assistant Message
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
        )
    )
