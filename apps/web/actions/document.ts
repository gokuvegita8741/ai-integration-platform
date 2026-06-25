"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Types
export interface Document {
    id: string;
    workspaceId: string;
    name: string;
    type: string;
    size: number;
    status: "processing" | "ready" | "error";
    uploadedAt: string;
    updatedAt: string;
}

// Helper to get auth header
async function getAuthHeaders(includeContentType = true) {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        throw new Error("Not authenticated");
    }
    const headers: Record<string, string> = {
        Authorization: `Bearer ${session.accessToken}`,
    };
    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
}

/**
 * Upload a document to a workspace (multipart form data)
 */
export async function uploadDocument(
    workspaceId: string,
    formData: FormData
): Promise<Document> {
    const headers = await getAuthHeaders(false);

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}/documents`, {
        method: "POST",
        headers,
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to upload document");
    }

    return response.json();
}

/**
 * Get documents for a workspace
 */
export async function getDocuments(workspaceId: string): Promise<Document[]> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/workspaces/${workspaceId}/documents`, {
        method: "GET",
        headers,
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to fetch documents");
    }

    return response.json();
}

/**
 * Rename a document
 */
export async function renameDocument(
    documentId: string,
    name: string
): Promise<Document> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/documents/${documentId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to rename document");
    }

    return response.json();
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<{ success: boolean }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/v1/documents/${documentId}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to delete document");
    }

    return response.json();
}
