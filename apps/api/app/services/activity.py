import base64
import json
from datetime import datetime
from typing import Optional, Any
from prisma.fields import Json
from app.db import prisma


MAX_ACTIVITY_LIMIT = 100
DEFAULT_ACTIVITY_LIMIT = 20


def _encode_cursor(activity: Any) -> str:
    payload = {
        "createdAt": activity.createdAt.isoformat(),
        "id": activity.id,
    }
    encoded = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8"))
    return encoded.decode("ascii")


def _decode_cursor(cursor: str) -> dict[str, Any]:
    decoded = base64.urlsafe_b64decode(cursor.encode("ascii"))
    payload = json.loads(decoded.decode("utf-8"))
    created_at = payload.get("createdAt")
    activity_id = payload.get("id")
    if not created_at or not activity_id:
        raise ValueError("Invalid cursor")

    if created_at.endswith("Z"):
        created_at = f"{created_at[:-1]}+00:00"

    return {
        "createdAt": datetime.fromisoformat(created_at),
        "id": activity_id,
    }


def _normalise_limit(limit: int) -> int:
    if limit < 1:
        return DEFAULT_ACTIVITY_LIMIT
    return min(limit, MAX_ACTIVITY_LIMIT)


class ActivityService:
    @staticmethod
    async def log_activity(
        user_id: str,
        action: str,
        entity_type: str,
        entity_id: Optional[str] = None,
        entity_name: Optional[str] = None,
        workspace_id: Optional[str] = None,
        metadata: Optional[Any] = None,
    ):
        """Log a user activity event."""
        create_data: dict[str, Any] = {
            "action": action,
            "entityType": entity_type,
            "user": {"connect": {"id": user_id}},
        }

        if entity_id is not None:
            create_data["entityId"] = entity_id
        if entity_name is not None:
            create_data["entityName"] = entity_name
        if workspace_id is not None:
            create_data["workspace"] = {"connect": {"id": workspace_id}}
        if metadata is not None:
            create_data["metadata"] = Json(metadata)

        await prisma.activitylog.create(data=create_data)

    @staticmethod
    async def get_workspace_activity(
        workspace_id: str,
        user_id: str,
        limit: int = DEFAULT_ACTIVITY_LIMIT,
        cursor: Optional[str] = None,
    ):
        """Get activity logs for a specific workspace."""
        # Verify user has access to workspace
        member = await prisma.workspacemember.find_unique(
            where={
                "userId_workspaceId": {
                    "userId": user_id,
                    "workspaceId": workspace_id,
                }
            }
        )
        if not member:
            return {
                "activities": [],
                "nextCursor": None,
                "hasMore": False,
            }

        take = _normalise_limit(limit)
        where_clause: dict[str, Any] = {"workspaceId": workspace_id}

        if cursor:
            decoded_cursor = _decode_cursor(cursor)
            where_clause["OR"] = [
                {"createdAt": {"lt": decoded_cursor["createdAt"]}},
                {
                    "createdAt": decoded_cursor["createdAt"],
                    "id": {"lt": decoded_cursor["id"]},
                },
            ]

        activities = await prisma.activitylog.find_many(
            where=where_clause,
            order=[{"createdAt": "desc"}, {"id": "desc"}],
            take=take + 1,
        )

        has_more = len(activities) > take
        page_activities = activities[:take]

        return {
            "activities": page_activities,
            "nextCursor": _encode_cursor(page_activities[-1]) if has_more and page_activities else None,
            "hasMore": has_more,
        }

    @staticmethod
    async def get_user_activity(
        user_id: str,
        limit: int = DEFAULT_ACTIVITY_LIMIT,
        cursor: Optional[str] = None,
    ):
        """Get recent activity for a user across all workspaces."""
        take = _normalise_limit(limit)
        where_clause: dict[str, Any] = {"userId": user_id}

        if cursor:
            decoded_cursor = _decode_cursor(cursor)
            where_clause["OR"] = [
                {"createdAt": {"lt": decoded_cursor["createdAt"]}},
                {
                    "createdAt": decoded_cursor["createdAt"],
                    "id": {"lt": decoded_cursor["id"]},
                },
            ]

        activities = await prisma.activitylog.find_many(
            where=where_clause,
            order=[{"createdAt": "desc"}, {"id": "desc"}],
            take=take + 1,
        )
        has_more = len(activities) > take
        page_activities = activities[:take]

        return {
            "activities": page_activities,
            "nextCursor": _encode_cursor(page_activities[-1]) if has_more and page_activities else None,
            "hasMore": has_more,
        }
