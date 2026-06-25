from typing import Optional, List
from fastapi import APIRouter, Depends
from prisma import models
from app.api import deps
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceResponse,
    WorkspaceListResponse,
)
from app.services.workspace import WorkspaceService

router = APIRouter()


@router.post("", response_model=WorkspaceResponse, status_code=201)
async def create_workspace(
    data: WorkspaceCreate,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Create a new workspace."""
    return await WorkspaceService.create_workspace(current_user.id, data)


@router.get("", response_model=List[WorkspaceResponse])
async def list_workspaces(
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "updatedAt",
    sort_order: str = "desc",
    current_user: models.User = Depends(deps.get_current_user),
):
    """List all workspaces for the current user."""
    return await WorkspaceService.get_workspaces(
        current_user.id,
        search=search,
        status_filter=status,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Get a workspace with stats."""
    return await WorkspaceService.get_workspace(workspace_id, current_user.id)


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    data: WorkspaceUpdate,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Update workspace details."""
    return await WorkspaceService.update_workspace(workspace_id, current_user.id, data)


@router.patch("/{workspace_id}/archive", response_model=WorkspaceResponse)
async def archive_workspace(
    workspace_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Archive a workspace."""
    return await WorkspaceService.archive_workspace(workspace_id, current_user.id)


@router.patch("/{workspace_id}/restore", response_model=WorkspaceResponse)
async def restore_workspace(
    workspace_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Restore an archived workspace."""
    return await WorkspaceService.restore_workspace(workspace_id, current_user.id)


@router.delete("/{workspace_id}")
async def delete_workspace(
    workspace_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Soft delete a workspace."""
    return await WorkspaceService.delete_workspace(workspace_id, current_user.id)
