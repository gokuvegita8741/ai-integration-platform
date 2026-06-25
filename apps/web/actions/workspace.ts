"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Types
export interface Workspace {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    status: "active" | "archived";
    createdAt: string;
    updatedAt: string;
    lastActivityAt?: string;
}

export interface WorkspaceWithStats extends Workspace {
    totalChats: number;
    totalDocuments: number;
    totalAgents: number;
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
 * Create a new workspace
 */
export async function createWorkspace(data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}): Promise<Workspace> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to create workspace");
    }

    return response.json();
}

/**
 * Get list of workspaces
 */
export async function getWorkspaces(params?: {
    search?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
}): Promise<Workspace[]> {
    const headers = await getAuthHeaders();

    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.sort_by) searchParams.set("sort_by", params.sort_by);
    if (params?.sort_order) searchParams.set("sort_order", params.sort_order);

    const queryString = searchParams.toString();
    const url = `${API_URL}/api/v1/workspaces${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch workspaces");
    }

    return response.json();
}

/**
 * Get a single workspace with stats
 */
export async function getWorkspace(workspaceId: string): Promise<WorkspaceWithStats> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch workspace");
    }

    return response.json();
}

/**
 * Update a workspace
 */
export async function updateWorkspace(
    workspaceId: string,
    data: Partial<Pick<Workspace, "name" | "description" | "icon" | "color">>
): Promise<Workspace> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to update workspace");
    }

    return response.json();
}

/**
 * Archive a workspace
 */
export async function archiveWorkspace(workspaceId: string): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}/archive`, {
        method: "PATCH",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to archive workspace");
    }

    return response.json();
}

/**
 * Restore an archived workspace
 */
export async function restoreWorkspace(workspaceId: string): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}/restore`, {
        method: "PATCH",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to restore workspace");
    }

    return response.json();
}

/**
 * Delete a workspace permanently
 */
export async function deleteWorkspace(workspaceId: string): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to delete workspace");
    }

    return response.json();
}
