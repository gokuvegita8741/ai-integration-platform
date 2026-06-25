"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Types
export interface ActivityItem {
    id: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    entityName?: string | null;
    metadata?: Record<string, unknown> | null;
    workspaceId?: string | null;
    userId: string;
    createdAt: string;
}

export interface ActivityFeedPage {
    activities: ActivityItem[];
    nextCursor: string | null;
    hasMore: boolean;
}

// Helper to get auth header
async function getAuthHeaders() {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        throw new Error("Not authenticated");
    }
    return {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
    };
}

/**
 * Get activity for a specific workspace
 */
export async function getWorkspaceActivity(
    workspaceId: string,
    params?: { limit?: number; cursor?: string | null }
): Promise<ActivityFeedPage> {
    const headers = await getAuthHeaders();

    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.cursor) searchParams.set("cursor", params.cursor);

    const queryString = searchParams.toString();
    const url = `${API_URL}/api/v1/workspaces/${workspaceId}/activity${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch workspace activity");
    }
    
    return response.json();
}

export async function getWorkspaceActivityItems(
    workspaceId: string,
    params?: { limit?: number; cursor?: string | null }
): Promise<ActivityItem[]> {
    const page = await getWorkspaceActivity(workspaceId, params);
    return page.activities;
}

/**
 * Get global activity across all workspaces
 */
export async function getGlobalActivity(params?: {
    limit?: number;
    cursor?: string | null;
}): Promise<ActivityFeedPage> {
    const headers = await getAuthHeaders();

    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.cursor) searchParams.set("cursor", params.cursor);

    const queryString = searchParams.toString();
    const url = `${API_URL}/api/v1/activity${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch activity");
    }

    return response.json();
}
