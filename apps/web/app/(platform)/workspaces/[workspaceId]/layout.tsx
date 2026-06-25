import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWorkspace } from "@/actions/workspace";
import { WorkspaceDetailClient } from "./workspace-detail-client";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceDetailLayout({
    children,
    params,
}: LayoutProps) {
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
        notFound();
    }

    return (
        <WorkspaceDetailClient workspace={workspace}>
            {children}
        </WorkspaceDetailClient>
    );
}
