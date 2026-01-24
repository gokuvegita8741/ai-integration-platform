from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

class ChatSource(str, Enum):
    standalone = "standalone"
    iframe = "iframe"

class ChatRequest(BaseModel):
    chatId: str # Mandatory now
    message: str
    imageUrl: Optional[str] = None
    # We don't need source/websiteDomain etc here as Chat must exist

# For Creating a new blank chat
class ChatCreateRequest(BaseModel):
    source: ChatSource = ChatSource.standalone
    websiteDomain: Optional[str] = None
    pagePath: Optional[str] = None
    projectName: Optional[str] = None

class ChatCreateResponse(BaseModel):
    chatId: str
    name: str

class ChatRenameRequest(BaseModel):
    name: str

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
    name: Optional[str] = None # Include updated name if changed


class ChatListItem(BaseModel):
    id: str
    name: str
    createdAt: datetime


class ChatDetailResponse(BaseModel):
    id: str
    name: str
    createdAt: datetime
    messages: List[ChatMessage]
