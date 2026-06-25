import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspaces, type Workspace } from "@/actions/workspace";
import { WorkspacesClient } from "./workspaces-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Workspaces — AI Workspace",
    description: "Manage your AI workspaces — organize projects, documents, and agents.",
};

export default async function WorkspacesPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    let workspaces: Workspace[] = [];
    try {
        workspaces = await getWorkspaces();
    } catch (error) {
        console.error("Error fetching workspaces:", error);
    }

    return <WorkspacesClient initialWorkspaces={workspaces} />;
}
