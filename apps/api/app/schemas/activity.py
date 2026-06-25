from typing import Optional, Any, List
from pydantic import BaseModel
from datetime import datetime


class ActivityResponse(BaseModel):
    id: str
    action: str
    entityType: str
    entityId: Optional[str] = None
    entityName: Optional[str] = None
    metadata: Optional[Any] = None
    workspaceId: Optional[str] = None
    userId: str
    createdAt: datetime

    class Config:
        from_attributes = True


class ActivityFeedResponse(BaseModel):
    activities: List[ActivityResponse]
    nextCursor: Optional[str] = None
    hasMore: bool = False
