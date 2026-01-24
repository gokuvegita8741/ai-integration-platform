"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Types
export interface ChatListItem {
    id: string;
    name: string;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    chatId: string;
    sender: "user" | "assistant";
    message: string;
    createdAt: string;
}

export interface ChatDetail {
    id: string;
    name: string;
    createdAt: string;
    messages: ChatMessage[];
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
 * Create a new chat
 */
export async function createChat(): Promise<{ chatId: string; name: string }> {
    const headers = await getAuthHeaders();
    console.log("HEADERS ->",headers)

    const response = await fetch(`${API_URL}/api/v1/chat/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({ source: "standalone" }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to create chat");
    }

    return response.json();
}

/**
 * Get list of user's chats
 */
export async function getChats(): Promise<ChatListItem[]> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/chat/list`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch chats");
    }

    return response.json();
}

/**
 * Get a single chat with messages
 */
export async function getChat(chatId: string): Promise<ChatDetail> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/chat/${chatId}`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch chat");
    }

    return response.json();
}

/**
 * Rename a chat
 */
export async function renameChat(
    chatId: string,
    newName: string
): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/chat/${chatId}/rename`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ name: newName }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to rename chat");
    }

    return response.json();
}

/**
 * Delete a chat
 */
export async function deleteChat(chatId: string): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/chat/${chatId}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to delete chat");
    }

    return response.json();
}

/**
 * Get stream URL and headers for client-side streaming
 * We return this because actual SSE streaming needs to happen client-side
 */
export async function getStreamConfig(chatId: string, message: string) {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        throw new Error("Not authenticated");
    }

    return {
        url: `${API_URL}/api/v1/chat/stream`,
        token: session.accessToken,
        body: { chatId, message },
    };
}
