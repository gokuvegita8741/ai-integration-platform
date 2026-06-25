import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWorkspace } from "@/actions/workspace";
import { getWorkspaceActivityItems } from "@/actions/activity";
import { Metadata } from "next";
import { WorkspaceOverviewClient } from "./overview-client";

interface PageProps {
    params: Promise<{ workspaceId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { workspaceId } = await params;
    try {
        const workspace = await getWorkspace(workspaceId);
        return {
            title: `${workspace.name} — AI Workspace`,
            description: workspace.description || `Overview of ${workspace.name} workspace`,
        };
    } catch {
        return { title: "Workspace — AI Workspace" };
    }
}

export default async function WorkspaceOverviewPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const { workspaceId } = await params;

    let workspace;
    let activity: any[] = [];

    try {
        [workspace, activity] = await Promise.all([
            getWorkspace(workspaceId),
            getWorkspaceActivityItems(workspaceId, { limit: 3 }).catch(() => []),
        ]);
    } catch (error) {
        console.error("Error loading workspace overview:", error);
        notFound();
    }

    return (
        <WorkspaceOverviewClient
            workspace={workspace}
            recentActivity={activity}
        />
    );
}
