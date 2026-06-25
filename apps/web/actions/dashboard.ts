"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Workspace } from "./workspace";
import type { ChatListItem } from "./chat";
import type { ActivityItem } from "./activity";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Types
export interface DashboardStats {
    totalWorkspaces: number;
    totalChats: number;
    totalDocuments: number;
    totalAgents: number;
}

export interface DashboardData {
    recentWorkspaces: Workspace[];
    recentChats: (ChatListItem & { workspaceName?: string; workspaceId?: string })[];
    stats: DashboardStats;
    recentActivity: ActivityItem[];
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
 * Get dashboard data
 */
export async function getDashboardData(): Promise<DashboardData> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/dashboard`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch dashboard data");
    }

    const res = await response.json();
    console.log("Dashboard Data: " + JSON.stringify(res, null, 2));
    return res;
}
