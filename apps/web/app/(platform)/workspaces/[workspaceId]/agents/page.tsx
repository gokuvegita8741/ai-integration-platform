import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAgents } from "@/actions/agent";
import { Metadata } from "next";
import { AgentsClient } from "./agents-client";

export const metadata: Metadata = {
    title: "Agents — AI Workspace",
    description: "Configure and manage AI agents in your workspace.",
};

interface PageProps {
    params: Promise<{ workspaceId: string }>;
}

export default async function AgentsPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const { workspaceId } = await params;

    let agents: any[] = [];
    try {
        agents = await getAgents(workspaceId);
    } catch (error) {
        console.error("Error fetching agents:", error);
    }

    return <AgentsClient workspaceId={workspaceId} initialAgents={agents} />;
}
