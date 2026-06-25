from typing import Optional
from fastapi import HTTPException, status
from app.db import prisma
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceResponse, WorkspaceStats
from app.services.activity import ActivityService


class WorkspaceService:
    @staticmethod
    async def create_workspace(user_id: str, data: WorkspaceCreate) -> WorkspaceResponse:
        """Create a new workspace with the user as owner."""
        async with prisma.tx() as tx:
            workspace = await tx.workspace.create(
                data={
                    "name": data.name,
                    "description": data.description,
                    "icon": data.icon,
                    "color": data.color,
                    "userId": user_id,
                }
            )

            await tx.workspacemember.create(
                data={
                    "userId": user_id,
                    "workspaceId": workspace.id,
                    "role": "owner",
                }
            )

        # Log activity outside transaction
        await ActivityService.log_activity(
            user_id=user_id,
            action="workspace_created",
            entity_type="workspace",
            entity_id=workspace.id,
            entity_name=workspace.name,
            workspace_id=workspace.id,
        )

        return WorkspaceResponse(
            id=workspace.id,
            name=workspace.name,
            description=workspace.description,
            icon=workspace.icon,
            color=workspace.color,
            status=workspace.status,
            createdAt=workspace.createdAt,
            updatedAt=workspace.updatedAt,
            lastActivityAt=workspace.lastActivityAt,
            stats=WorkspaceStats(),
        )

    @staticmethod
    async def get_workspaces(
        user_id: str,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "updatedAt",
        sort_order: str = "desc",
    ):
        """Get all workspaces the user is a member of."""
        where_clause: dict = {"userId": user_id}

        if status_filter:
            where_clause["status"] = status_filter
        else:
            # Default: show active workspaces
            where_clause["status"] = {"not": "deleted"}

        if search:
            where_clause["name"] = {"contains": search, "mode": "insensitive"}

        # Build order clause
        order = {sort_by: sort_order}

        workspaces = await prisma.workspace.find_many(
            where=where_clause,
            order=order,
        )

        result = []
        for ws in workspaces:
            # Get stats for each workspace
            chat_count = await prisma.chat.count(where={"workspaceId": ws.id})
            doc_count = await prisma.document.count(where={"workspaceId": ws.id})
            agent_count = await prisma.agent.count(where={"workspaceId": ws.id})

            result.append(
                WorkspaceResponse(
                    id=ws.id,
                    name=ws.name,
                    description=ws.description,
                    icon=ws.icon,
                    color=ws.color,
                    status=ws.status,
                    createdAt=ws.createdAt,
                    updatedAt=ws.updatedAt,
                    lastActivityAt=ws.lastActivityAt,
                    stats=WorkspaceStats(
                        totalChats=chat_count,
                        totalDocuments=doc_count,
                        totalAgents=agent_count,
                    ),
                )
            )

        return result

    @staticmethod
    async def get_workspace(workspace_id: str, user_id: str) -> WorkspaceResponse:
        """Get a single workspace with stats."""
        workspace = await prisma.workspace.find_unique(where={"id": workspace_id})

        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )

        if workspace.userId != user_id:
            # Check if user is a member
            member = await prisma.workspacemember.find_unique(
                where={
                    "userId_workspaceId": {
                        "userId": user_id,
                        "workspaceId": workspace_id,
                    }
                }
            )
            if not member:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to access this workspace",
                )

        chat_count = await prisma.chat.count(where={"workspaceId": workspace_id})
        doc_count = await prisma.document.count(where={"workspaceId": workspace_id})
        agent_count = await prisma.agent.count(where={"workspaceId": workspace_id})

        return WorkspaceResponse(
            id=workspace.id,
            name=workspace.name,
            description=workspace.description,
            icon=workspace.icon,
            color=workspace.color,
            status=workspace.status,
            createdAt=workspace.createdAt,
            updatedAt=workspace.updatedAt,
            lastActivityAt=workspace.lastActivityAt,
            stats=WorkspaceStats(
                totalChats=chat_count,
                totalDocuments=doc_count,
                totalAgents=agent_count,
            ),
        )

    @staticmethod
    async def update_workspace(
        workspace_id: str, user_id: str, data: WorkspaceUpdate
    ) -> WorkspaceResponse:
        """Update workspace details."""
        workspace = await prisma.workspace.find_unique(where={"id": workspace_id})

        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )
        if workspace.userId != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to modify this workspace",
            )

        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update",
            )

        updated = await prisma.workspace.update(
            where={"id": workspace_id},
            data=update_data,
        )

        await ActivityService.log_activity(
            user_id=user_id,
            action="workspace_updated",
            entity_type="workspace",
            entity_id=workspace_id,
            entity_name=updated.name,
            workspace_id=workspace_id,
            metadata={"updated_fields": list(update_data.keys())},
        )

        return await WorkspaceService.get_workspace(workspace_id, user_id)

    @staticmethod
    async def archive_workspace(workspace_id: str, user_id: str) -> WorkspaceResponse:
        """Archive a workspace."""
        workspace = await prisma.workspace.find_unique(where={"id": workspace_id})

        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )
        if workspace.userId != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        await prisma.workspace.update(
            where={"id": workspace_id},
            data={"status": "archived"},
        )

        await ActivityService.log_activity(
            user_id=user_id,
            action="workspace_updated",
            entity_type="workspace",
            entity_id=workspace_id,
            entity_name=workspace.name,
            workspace_id=workspace_id,
            metadata={"action": "archived"},
        )

        return await WorkspaceService.get_workspace(workspace_id, user_id)

    @staticmethod
    async def restore_workspace(workspace_id: str, user_id: str) -> WorkspaceResponse:
        """Restore an archived workspace."""
        workspace = await prisma.workspace.find_unique(where={"id": workspace_id})

        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )
        if workspace.userId != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        await prisma.workspace.update(
            where={"id": workspace_id},
            data={"status": "active"},
        )

        await ActivityService.log_activity(
            user_id=user_id,
            action="workspace_updated",
            entity_type="workspace",
            entity_id=workspace_id,
            entity_name=workspace.name,
            workspace_id=workspace_id,
            metadata={"action": "restored"},
        )

        return await WorkspaceService.get_workspace(workspace_id, user_id)

    @staticmethod
    async def delete_workspace(workspace_id: str, user_id: str):
        """Soft delete a workspace."""
        workspace = await prisma.workspace.find_unique(where={"id": workspace_id})

        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found",
            )
        if workspace.userId != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized",
            )

        await prisma.workspace.update(
            where={"id": workspace_id},
            data={"status": "deleted"},
        )

        await ActivityService.log_activity(
            user_id=user_id,
            action="workspace_updated",
            entity_type="workspace",
            entity_id=workspace_id,
            entity_name=workspace.name,
            workspace_id=workspace_id,
            metadata={"action": "deleted"},
        )

        return {"success": True, "message": "Workspace deleted"}
