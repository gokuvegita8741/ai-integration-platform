from typing import Optional, Any
from pydantic import BaseModel


class UserSettings(BaseModel):
    theme: Optional[str] = None
    aiModel: Optional[str] = None
    defaultWorkspaceId: Optional[str] = None


class WorkspaceSettings(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    aiConfig: Optional[Any] = None
    knowledgeConfig: Optional[Any] = None
