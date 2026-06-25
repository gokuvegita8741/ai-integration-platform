from fastapi import APIRouter
from app.api.v1.endpoints import auth, chat, workspace, document, agent, activity, search, settings, dashboard

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(workspace.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(document.router, tags=["documents"])
api_router.include_router(agent.router, tags=["agents"])
api_router.include_router(activity.router, tags=["activity"])
api_router.include_router(search.router, tags=["search"])
api_router.include_router(settings.router, tags=["settings"])
api_router.include_router(dashboard.router, tags=["dashboard"])
