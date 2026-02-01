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


# Version schema for individual message versions
class ChatMessageVersion(BaseModel):
    id: str
    versionNumber: int
    content: str
    createdAt: datetime
    model: Optional[str] = None


# Legacy ChatMessage (for backward compatibility in some responses)
class ChatMessage(BaseModel):
    id: str
    chatId: str
    sender: MessageSender
    message: str
    createdAt: datetime


# Enhanced ChatMessage with version support
class ChatMessageWithVersions(BaseModel):
    id: str
    chatId: str
    sender: MessageSender
    sequence: int
    isActive: bool
    content: str  # Resolved from activeVersion or legacy message
    versions: List[ChatMessageVersion] = []
    activeVersionNumber: Optional[int] = None
    totalVersions: int = 1
    createdAt: datetime


# Request schemas for regenerate feature
class RegenerateRequest(BaseModel):
    pass  # No body needed, messageId comes from path


class SwitchVersionRequest(BaseModel):
    versionNumber: int


class ChatResponse(BaseModel):
    chatId: str
    message: ChatMessage
    name: Optional[str] = None  # Include updated name if changed


# Response for regenerate and switch endpoints
class RegenerateResponse(BaseModel):
    chatId: str
    message: ChatMessageWithVersions
    truncatedCount: int = 0  # Number of messages deactivated


class ChatListItem(BaseModel):
    id: str
    name: str
    createdAt: datetime


class ChatDetailResponse(BaseModel):
    id: str
    name: str
    createdAt: datetime
    messages: List[ChatMessageWithVersions]

