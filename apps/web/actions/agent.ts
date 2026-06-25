"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Types
export interface Agent {
    id: string;
    workspaceId: string;
    name: string;
    description?: string;
    type: "research" | "coding" | "writing" | "data" | "custom";
    enabled: boolean;
    config?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
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
 * Create an agent in a workspace
 */
export async function createAgent(
    workspaceId: string,
    data: {
        name: string;
        description?: string;
        type: Agent["type"];
    }
): Promise<Agent> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}/agents`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to create agent");
    }

    return response.json();
}

/**
 * Get agents for a workspace
 */
export async function getAgents(workspaceId: string): Promise<Agent[]> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}/agents`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch agents");
    }

    return response.json();
}

/**
 * Get a single agent
 */
export async function getAgent(agentId: string): Promise<Agent> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/agents/${agentId}`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch agent");
    }

    return response.json();
}

/**
 * Update an agent
 */
export async function updateAgent(
    agentId: string,
    data: Partial<Pick<Agent, "name" | "description" | "type" | "config">>
): Promise<Agent> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/agents/${agentId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to update agent");
    }

    return response.json();
}

/**
 * Toggle agent enabled/disabled
 */
export async function toggleAgent(agentId: string): Promise<{ success: boolean; enabled: boolean }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/agents/${agentId}/toggle`, {
        method: "PATCH",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to toggle agent");
    }

    return response.json();
}

/**
 * Delete an agent
 */
export async function deleteAgent(agentId: string): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/agents/${agentId}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to delete agent");
    }

    return response.json();
}
