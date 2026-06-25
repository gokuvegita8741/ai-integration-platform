"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, FileText, Bot, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Workspace } from "@/actions/workspace";

interface WorkspaceCardProps {
    workspace: Workspace;
    stats?: { totalChats?: number; totalDocuments?: number; totalAgents?: number };
    className?: string;
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

const defaultIcons: Record<string, string> = {
    "🚀": "🚀", "💡": "💡", "📊": "📊", "🎨": "🎨",
    "🔬": "🔬", "📝": "📝", "🤖": "🤖", "🎯": "🎯",
};

export function WorkspaceCard({ workspace, stats, className }: WorkspaceCardProps) {
    const router = useRouter();
    const accentColor = workspace.color || "#6366f1";

    return (
        <div
            onClick={() => router.push(`/workspaces/${workspace.id}`)}
            className={cn(
                "group relative glass-card rounded-2xl p-5 cursor-pointer card-hover card-hover-glow overflow-hidden",
                className
            )}
            style={{ "--workspace-accent": accentColor } as React.CSSProperties}
        >
            {/* Color accent border */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                style={{ backgroundColor: accentColor }}
            />

            {/* Icon + Name */}
            <div className="flex items-start gap-3 mb-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${accentColor}20` }}
                >
                    {workspace.icon && defaultIcons[workspace.icon]
                        ? workspace.icon
                        : (
                            <span style={{ color: accentColor }} className="text-sm font-bold">
                                {workspace.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                        {workspace.name}
                    </h3>
                    {workspace.description && (
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                            {workspace.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-zinc-500 mt-4">
                <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {stats?.totalChats ?? 0}
                </span>
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {stats?.totalDocuments ?? 0}
                </span>
                <span className="flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    {stats?.totalAgents ?? 0}
                </span>
            </div>

            {/* Last Activity */}
            <div className="flex items-center gap-1 text-[10px] text-zinc-600 mt-3">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(workspace.lastActivityAt || workspace.updatedAt)}
            </div>

            {/* Hover glow effect */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accentColor}08, transparent 40%)`,
                }}
            />
        </div>
    );
}
