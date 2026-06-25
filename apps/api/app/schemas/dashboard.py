from typing import List, Any
from pydantic import BaseModel
from datetime import datetime
from app.schemas.workspace import WorkspaceResponse
from app.schemas.activity import ActivityResponse


class DashboardStats(BaseModel):
    totalWorkspaces: int = 0
    totalChats: int = 0
    totalDocuments: int = 0
    totalAgents: int = 0


class RecentChat(BaseModel):
    id: str
    name: str
    workspaceId: str | None = None
    workspaceName: str | None = None
    createdAt: datetime


class DashboardResponse(BaseModel):
    recentWorkspaces: List[WorkspaceResponse]
    recentChats: List[RecentChat]
    stats: DashboardStats
    recentActivity: List[ActivityResponse]
