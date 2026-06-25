from fastapi import APIRouter, Depends
from prisma import models
from app.api import deps
from app.db import prisma
from app.schemas.dashboard import DashboardResponse, DashboardStats, RecentChat
from app.schemas.workspace import WorkspaceResponse, WorkspaceStats
from app.schemas.activity import ActivityResponse

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: models.User = Depends(deps.get_current_user),
):
    """Get aggregated dashboard data."""

    # Recent workspaces
    workspaces = await prisma.workspace.find_many(
        where={"userId": current_user.id, "status": {"not": "deleted"}},
        order={"lastActivityAt": "desc"},
        take=5,
    )

    recent_workspaces = []
    for ws in workspaces:
        chat_count = await prisma.chat.count(where={"workspaceId": ws.id})
        doc_count = await prisma.document.count(where={"workspaceId": ws.id})
        agent_count = await prisma.agent.count(where={"workspaceId": ws.id})

        recent_workspaces.append(
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

    # Recent chats
    chats = await prisma.chat.find_many(
        where={"userId": current_user.id},
        order={"createdAt": "desc"},
        take=5,
        include={"workspace": True},
    )

    recent_chats = [
        RecentChat(
            id=chat.id,
            name=chat.name,
            workspaceId=chat.workspaceId,
            workspaceName=chat.workspace.name if chat.workspace else None,
            createdAt=chat.createdAt,
        )
        for chat in chats
    ]

    # Stats
    total_workspaces = await prisma.workspace.count(
        where={"userId": current_user.id, "status": {"not": "deleted"}}
    )
    total_chats = await prisma.chat.count(
        where={"userId": current_user.id}
    )
    total_documents = await prisma.document.count(
        where={"userId": current_user.id}
    )
    total_agents = await prisma.agent.count(
        where={"userId": current_user.id}
    )

    stats = DashboardStats(
        totalWorkspaces=total_workspaces,
        totalChats=total_chats,
        totalDocuments=total_documents,
        totalAgents=total_agents,
    )

    # Recent activity
    activities = await prisma.activitylog.find_many(
        where={"userId": current_user.id},
        order={"createdAt": "desc"},
        take=5,
    )

    recent_activity = [
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
        for a in activities
    ]

    return DashboardResponse(
        recentWorkspaces=recent_workspaces,
        recentChats=recent_chats,
        stats=stats,
        recentActivity=recent_activity,
    )
