"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Types
export interface UserSettings {
    id: string;
    theme: "light" | "dark" | "system";
    language: string;
    notifications: {
        email: boolean;
        push: boolean;
        chatUpdates: boolean;
    };
    aiPreferences: {
        defaultModel?: string;
        temperature?: number;
        maxTokens?: number;
    };
}

export interface WorkspaceSettings {
    id: string;
    workspaceId: string;
    defaultModel?: string;
    ragEnabled: boolean;
    chunkSize?: number;
    overlapSize?: number;
    embeddingModel?: string;
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
 * Get user settings
 */
export async function getUserSettings(): Promise<UserSettings> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/settings/user`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch user settings");
    }

    return response.json();
}

/**
 * Update user settings
 */
export async function updateUserSettings(
    data: Partial<UserSettings>
): Promise<UserSettings> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/settings/user`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to update user settings");
    }

    return response.json();
}

/**
 * Get workspace-specific settings
 */
export async function getWorkspaceSettings(
    workspaceId: string
): Promise<WorkspaceSettings> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}/settings`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch workspace settings");
    }

    return response.json();
}

/**
 * Update workspace-specific settings
 */
export async function updateWorkspaceSettings(
    workspaceId: string,
    data: Partial<WorkspaceSettings>
): Promise<WorkspaceSettings> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to update workspace settings");
    }

    return response.json();
}
