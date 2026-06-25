from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from prisma import models
from app.api import deps
from app.schemas.activity import ActivityResponse, ActivityFeedResponse
from app.services.activity import ActivityService

router = APIRouter()


@router.get(
    "/workspaces/{workspace_id}/activity",
    response_model=ActivityFeedResponse,
)
async def get_workspace_activity(
    workspace_id: str,
    limit: int = 20,
    cursor: Optional[str] = None,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Get activity logs for a specific workspace."""
    try:
        page = await ActivityService.get_workspace_activity(
            workspace_id, current_user.id, limit=limit, cursor=cursor
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid activity cursor")

    return ActivityFeedResponse(
        activities=[
            ActivityResponse(
                id=a.id,
                action=a.action,
                entityType=a.entityType,
                entityId=a.entityId,
                entityName=a.entityName,
                metadata=a.metadata,
                workspaceId=a.workspaceId,
                userId=a.userId,
                createdAt=a.createdAt,
            )
            for a in page["activities"]
        ],
        nextCursor=page["nextCursor"],
        hasMore=page["hasMore"],
    )


@router.get("/activity", response_model=ActivityFeedResponse)
async def get_user_activity(
    limit: int = 20,
    cursor: Optional[str] = None,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Get recent activity for the current user."""
    try:
        page = await ActivityService.get_user_activity(
            current_user.id, limit=limit, cursor=cursor
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid activity cursor")

    return ActivityFeedResponse(
        activities=[
            ActivityResponse(
                id=a.id,
                action=a.action,
                entityType=a.entityType,
                entityId=a.entityId,
                entityName=a.entityName,
                metadata=a.metadata,
                workspaceId=a.workspaceId,
                userId=a.userId,
                createdAt=a.createdAt,
            )
            for a in page["activities"]
        ],
        nextCursor=page["nextCursor"],
        hasMore=page["hasMore"],
    )
