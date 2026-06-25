import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDocuments } from "@/actions/document";
import { Metadata } from "next";
import { DocumentsClient } from "./documents-client";

export const metadata: Metadata = {
    title: "Documents — AI Workspace",
    description: "Manage documents in your workspace.",
};

interface PageProps {
    params: Promise<{ workspaceId: string }>;
}

export default async function DocumentsPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const { workspaceId } = await params;

    let documents: any[] = [];
    try {
        documents = await getDocuments(workspaceId);
    } catch (error) {
        console.error("Error fetching documents:", error);
    }

    return <DocumentsClient workspaceId={workspaceId} initialDocuments={documents} />;
}
