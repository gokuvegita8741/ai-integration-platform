from typing import List
from fastapi import APIRouter, Depends, HTTPException
from prisma import models
from app.api import deps
from app.db import prisma
from app.schemas.search import SearchResult, SearchResponse

router = APIRouter()


@router.get("/search", response_model=SearchResponse)
async def global_search(
    q: str,
    current_user: models.User = Depends(deps.get_current_user),
):
    """Search across workspaces, chats, documents, and agents."""
    if not q or len(q.strip()) < 1:
        return SearchResponse(results=[], total=0)

    query = q.strip()
    results: List[SearchResult] = []

    # Search workspaces
    workspaces = await prisma.workspace.find_many(
        where={
            "userId": current_user.id,
            "status": {"not": "deleted"},
            "name": {"contains": query, "mode": "insensitive"},
        },
        take=10,
    )
    for ws in workspaces:
        results.append(
            SearchResult(
                type="workspace",
                id=ws.id,
                name=ws.name,
                description=ws.description,
                createdAt=ws.createdAt,
            )
        )

    # Search chats
    chats = await prisma.chat.find_many(
        where={
            "userId": current_user.id,
            "name": {"contains": query, "mode": "insensitive"},
        },
        include={"workspace": True},
        take=10,
    )
    for chat in chats:
        ws_name = chat.workspace.name if chat.workspace else None
        results.append(
            SearchResult(
                type="chat",
                id=chat.id,
                name=chat.name,
                workspaceId=chat.workspaceId,
                workspaceName=ws_name,
                createdAt=chat.createdAt,
            )
        )

    # Search documents
    documents = await prisma.document.find_many(
        where={
            "userId": current_user.id,
            "name": {"contains": query, "mode": "insensitive"},
        },
        include={"workspace": True},
        take=10,
    )
    for doc in documents:
        results.append(
            SearchResult(
                type="document",
                id=doc.id,
                name=doc.name,
                workspaceId=doc.workspaceId,
                workspaceName=doc.workspace.name if doc.workspace else None,
                createdAt=doc.createdAt,
            )
        )

    # Search agents
    agents = await prisma.agent.find_many(
        where={
            "userId": current_user.id,
            "name": {"contains": query, "mode": "insensitive"},
        },
        include={"workspace": True},
        take=10,
    )
    for agent in agents:
        results.append(
            SearchResult(
                type="agent",
                id=agent.id,
                name=agent.name,
                description=agent.description,
                workspaceId=agent.workspaceId,
                workspaceName=agent.workspace.name if agent.workspace else None,
                createdAt=agent.createdAt,
            )
        )

    # Sort by createdAt descending
    results.sort(key=lambda r: r.createdAt, reverse=True)

    return SearchResponse(results=results, total=len(results))
