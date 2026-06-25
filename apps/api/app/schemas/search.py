from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class SearchResult(BaseModel):
    type: str  # "workspace", "chat", "document", "agent"
    id: str
    name: str
    description: Optional[str] = None
    workspaceId: Optional[str] = None
    workspaceName: Optional[str] = None
    createdAt: datetime


class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int
