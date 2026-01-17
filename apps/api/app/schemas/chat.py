from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

class ChatSource(str, Enum):
    standalone = "standalone"
    iframe = "iframe"

class ChatRequest(BaseModel):
    chatId: Optional[str] = None
    message: str
    imageUrl: Optional[str] = None
    source: ChatSource = ChatSource.standalone
    websiteDomain: Optional[str] = None
    pagePath: Optional[str] = None
    projectName: Optional[str] = None

class MessageSender(str, Enum):
    user = "user"
    assistant = "assistant"

class ChatMessage(BaseModel):
    id: str
    chatId: str
    sender: MessageSender
    message: str
    createdAt: datetime

class ChatResponse(BaseModel):
    chatId: str
    message: ChatMessage
