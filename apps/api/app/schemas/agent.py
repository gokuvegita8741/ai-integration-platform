from typing import Optional, Any
from pydantic import BaseModel
from datetime import datetime


class AgentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = "custom"
    config: Optional[Any] = None


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    config: Optional[Any] = None


class AgentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    type: str
    config: Optional[Any] = None
    enabled: bool
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
