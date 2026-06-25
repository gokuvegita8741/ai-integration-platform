from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class WorkspaceStats(BaseModel):
    totalChats: int = 0
    totalDocuments: int = 0
    totalAgents: int = 0


class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    status: str
    createdAt: datetime
    updatedAt: datetime
    lastActivityAt: datetime
    stats: Optional[WorkspaceStats] = None

    class Config:
        from_attributes = True


class WorkspaceListResponse(BaseModel):
    workspaces: List[WorkspaceResponse]
