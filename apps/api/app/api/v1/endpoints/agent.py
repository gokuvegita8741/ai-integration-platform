from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from prisma import models
from app.api import deps
from app.db import prisma
from app.schemas.agent import AgentCreate, AgentUpdate, AgentResponse
from app.services.activity import ActivityService

router = APIRouter()


@router.post(
    "/workspaces/{workspace_id}/agents",
    response_model=AgentResponse,
    status_code=201,
)
async def create_agent(
    workspace_id: str,
    data: AgentCreate,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Create a new agent in a workspace."""
    workspace = await prisma.workspace.find_unique(where={"id": workspace_id})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if workspace.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    agent = await prisma.agent.create(
        data={
            "name": data.name,
            "description": data.description,
            "type": data.type or "custom",
            "config": data.config if data.config else None,
            "workspaceId": workspace_id,
            "userId": current_user.id,
        }
    )

    await ActivityService.log_activity(
        user_id=current_user.id,
        action="agent_created",
        entity_type="agent",
        entity_id=agent.id,
        entity_name=agent.name,
        workspace_id=workspace_id,
    )

    return AgentResponse(
        id=agent.id,
        name=agent.name,
        description=agent.description,
        type=agent.type,
        config=agent.config,
        enabled=agent.enabled,
        createdAt=agent.createdAt,
        updatedAt=agent.updatedAt,
    )


@router.get(
    "/workspaces/{workspace_id}/agents",
    response_model=List[AgentResponse],
)
async def list_agents(
    workspace_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """List all agents in a workspace."""
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

    agents = await prisma.agent.find_many(
        where={"workspaceId": workspace_id},
        order={"createdAt": "desc"},
    )

    return [
        AgentResponse(
            id=a.id,
            name=a.name,
            description=a.description,
            type=a.type,
            config=a.config,
            enabled=a.enabled,
            createdAt=a.createdAt,
            updatedAt=a.updatedAt,
        )
        for a in agents
    ]


@router.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Get an agent by ID."""
    agent = await prisma.agent.find_unique(where={"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return AgentResponse(
        id=agent.id,
        name=agent.name,
        description=agent.description,
        type=agent.type,
        config=agent.config,
        enabled=agent.enabled,
        createdAt=agent.createdAt,
        updatedAt=agent.updatedAt,
    )


@router.put("/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    data: AgentUpdate,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Update an agent."""
    agent = await prisma.agent.find_unique(where={"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    updated = await prisma.agent.update(
        where={"id": agent_id},
        data=update_data,
    )

    await ActivityService.log_activity(
        user_id=current_user.id,
        action="agent_updated",
        entity_type="agent",
        entity_id=agent_id,
        entity_name=updated.name,
        workspace_id=agent.workspaceId,
    )

    return AgentResponse(
        id=updated.id,
        name=updated.name,
        description=updated.description,
        type=updated.type,
        config=updated.config,
        enabled=updated.enabled,
        createdAt=updated.createdAt,
        updatedAt=updated.updatedAt,
    )


@router.patch("/agents/{agent_id}/toggle", response_model=AgentResponse)
async def toggle_agent(
    agent_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Enable or disable an agent."""
    agent = await prisma.agent.find_unique(where={"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    updated = await prisma.agent.update(
        where={"id": agent_id},
        data={"enabled": not agent.enabled},
    )

    await ActivityService.log_activity(
        user_id=current_user.id,
        action="agent_updated",
        entity_type="agent",
        entity_id=agent_id,
        entity_name=updated.name,
        workspace_id=agent.workspaceId,
        metadata={"enabled": updated.enabled},
    )

    return AgentResponse(
        id=updated.id,
        name=updated.name,
        description=updated.description,
        type=updated.type,
        config=updated.config,
        enabled=updated.enabled,
        createdAt=updated.createdAt,
        updatedAt=updated.updatedAt,
    )


@router.delete("/agents/{agent_id}")
async def delete_agent(
    agent_id: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Delete an agent."""
    agent = await prisma.agent.find_unique(where={"id": agent_id})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if agent.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    workspace_id = agent.workspaceId
    agent_name = agent.name

    await prisma.agent.delete(where={"id": agent_id})

    await ActivityService.log_activity(
        user_id=current_user.id,
        action="agent_deleted",
        entity_type="agent",
        entity_id=agent_id,
        entity_name=agent_name,
        workspace_id=workspace_id,
    )

    return {"success": True, "message": "Agent deleted"}
