import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspace } from "@/actions/workspace";
import { Metadata } from "next";
import { WorkspaceSettingsClient } from "./workspace-settings-client";

export const metadata: Metadata = {
    title: "Workspace Settings — AI Workspace",
    description: "Configure your workspace settings.",
};

interface PageProps {
    params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceSettingsPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const { workspaceId } = await params;

    let workspace;
    try {
        workspace = await getWorkspace(workspaceId);
    } catch (error) {
        console.error("Error fetching workspace:", error);
        redirect("/workspaces");
    }

    return <WorkspaceSettingsClient workspace={workspace} />;
}
