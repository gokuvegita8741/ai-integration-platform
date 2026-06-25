"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Types
export interface SearchResult {
    id: string;
    type: "workspace" | "chat" | "document" | "agent";
    title: string;
    description?: string;
    workspaceId?: string;
    workspaceName?: string;
    url: string;
    createdAt: string;
}

export interface SearchResponse {
    results: SearchResult[];
    total: number;
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
 * Global search across all resources
 */
export async function globalSearch(query: string): Promise<SearchResponse> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/search?q=${encodeURIComponent(query)}`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Search failed");
    }

    return response.json();
}
