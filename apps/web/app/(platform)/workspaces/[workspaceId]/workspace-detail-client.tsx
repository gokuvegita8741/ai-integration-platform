"use client";

import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import type { WorkspaceWithStats } from "@/actions/workspace";

interface WorkspaceDetailClientProps {
    workspace: WorkspaceWithStats;
    children: React.ReactNode;
}

export function WorkspaceDetailClient({
    workspace,
    children,
}: WorkspaceDetailClientProps) {
    return (
        <div className="flex min-h-0 -m-4 lg:-m-6">
            {/* Workspace Sidebar — hidden on small screens, shown on md+ */}
            <div className="hidden md:block border-r border-white/[0.04]">
                <WorkspaceSidebar workspace={workspace} className="sticky top-0 h-[calc(100vh-var(--header-height))]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
