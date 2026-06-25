import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspaces } from "@/actions/workspace";
import type { Workspace } from "@/actions/workspace";
import { PlatformLayoutClient } from "./platform-layout-client";

export default async function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    let workspaces: Workspace[] = [];
    try {
        workspaces = await getWorkspaces();
    } catch (error) {
        console.error("Error fetching workspaces for sidebar:", error);
    }

    return (
        <PlatformLayoutClient workspaces={workspaces}>
            {children}
        </PlatformLayoutClient>
    );
}
