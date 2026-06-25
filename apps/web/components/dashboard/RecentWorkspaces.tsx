"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, Boxes } from "lucide-react";
import Link from "next/link";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Workspace } from "@/actions/workspace";

interface RecentWorkspacesProps {
    workspaces: Workspace[];
    className?: string;
}

export function RecentWorkspaces({ workspaces, className }: RecentWorkspacesProps) {
    if (workspaces.length === 0) {
        return (
            <div className={className}>
                <EmptyState
                    icon={Boxes}
                    title="No workspaces yet"
                    description="Create your first workspace to organize your AI projects, documents, and agents."
                />
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-100">
                    Recent Workspaces
                </h2>
                <Link
                    href="/workspaces"
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
                >
                    View all <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {workspaces.slice(0, 6).map((ws, i) => (
                    <div key={ws.id} className={cn("animate-slideUp opacity-0", `animate-delay-${(i + 1) * 100}`)}>
                        <WorkspaceCard workspace={ws} />
                    </div>
                ))}
            </div>
        </div>
    );
}
