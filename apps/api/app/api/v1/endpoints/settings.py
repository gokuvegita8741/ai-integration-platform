from fastapi import APIRouter, Depends, HTTPException
from prisma import models
from app.api import deps
from app.db import prisma
from app.schemas.settings import UserSettings, WorkspaceSettings
from app.services.activity import ActivityService

router = APIRouter()


@router.get("/settings/user", response_model=UserSettings)
async def get_user_settings(
    current_user: models.User = Depends(deps.get_current_user),
):
    """Get user settings. Currently returns defaults since settings are not yet stored."""
    # Future: store settings in a UserSettings model
    # For now, return defaults
    return UserSettings()


@router.put("/settings/user", response_model=UserSettings)
async def update_user_settings(
    data: UserSettings,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Update user settings."""
    # Future: persist settings
    await ActivityService.log_activity(
        user_id=current_user.id,
        action="settings_updated",
        entity_type="user",
        entity_id=current_user.id,
        entity_name="User Settings",
    )
    return data


@router.get(
    "/workspaces/{workspace_id}/settings",
    response_model=WorkspaceSettings,
)
async def get_workspace_settings(
    workspace_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Get workspace settings."""
    workspace = await prisma.workspace.find_unique(where={"id": workspace_id})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if workspace.userId != current_user.id:
        member = await prisma.workspacemember.find_unique(
            where={
                "userId_workspaceId": {
                    "userId": current_user.id,
                    "workspaceId": workspace_id,
                }
            }
        )
        if not member:
            raise HTTPException(status_code=403, detail="Not authorized")

    return WorkspaceSettings(
        name=workspace.name,
        description=workspace.description,
        icon=workspace.icon,
        color=workspace.color,
    )


@router.put(
    "/workspaces/{workspace_id}/settings",
    response_model=WorkspaceSettings,
)
async def update_workspace_settings(
    workspace_id: str,
    data: WorkspaceSettings,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Update workspace settings."""
    workspace = await prisma.workspace.find_unique(where={"id": workspace_id})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if workspace.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await prisma.workspace.update(
        where={"id": workspace_id},
        data={
            "name": data.name,
            "description": data.description,
            "icon": data.icon,
            "color": data.color,
        },
    )

    await ActivityService.log_activity(
        user_id=current_user.id,
        action="settings_updated",
        entity_type="workspace",
        entity_id=workspace_id,
        entity_name=workspace.name,
        workspace_id=workspace_id,
    )

    return data
