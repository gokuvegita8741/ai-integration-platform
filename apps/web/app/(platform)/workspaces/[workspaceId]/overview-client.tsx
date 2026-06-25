"use client";

import { cn } from "@/lib/utils";
import {
    MessageSquare,
    FileText,
    Bot,
    Clock,
    Sparkles,
    Brain,
    Workflow,
    Plug,
    Activity,
} from "lucide-react";
import type { WorkspaceWithStats } from "@/actions/workspace";
import type { ActivityItem } from "@/actions/activity";

interface WorkspaceOverviewClientProps {
    workspace: WorkspaceWithStats;
    recentActivity: ActivityItem[];
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

const futureModules = [
    {
        icon: Brain,
        title: "Memory",
        description: "Persistent context and knowledge retention across conversations",
        gradient: "from-purple-600/20 to-pink-600/20",
    },
    {
        icon: Workflow,
        title: "Workflows",
        description: "Automate multi-step AI tasks with visual workflow builder",
        gradient: "from-blue-600/20 to-cyan-600/20",
    },
    {
        icon: Plug,
        title: "Integrations",
        description: "Connect with external tools, APIs, and data sources",
        gradient: "from-emerald-600/20 to-teal-600/20",
    },
];

export function WorkspaceOverviewClient({
    workspace,
    recentActivity,
}: WorkspaceOverviewClientProps) {
    const accentColor = workspace.color || "#6366f1";

    return (
        <div className="space-y-8">
            {/* Workspace Info Card */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden animate-fadeIn">
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        background: `linear-gradient(135deg, ${accentColor}, transparent 60%)`,
                    }}
                />
                <div className="relative z-10">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                            style={{ backgroundColor: `${accentColor}20` }}
                        >
                            {workspace.icon || (
                                <span
                                    className="text-lg font-bold"
                                    style={{ color: accentColor }}
                                >
                                    {workspace.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
                                {workspace.name}
                            </h1>
                            {workspace.description && (
                                <p className="text-sm text-zinc-400 mt-1">
                                    {workspace.description}
                                </p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-zinc-600 mt-2">
                                <Clock className="w-3 h-3" />
                                Created {new Date(workspace.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 animate-slideUp opacity-0 animate-delay-100">
                {[
                    { icon: MessageSquare, label: "Chats", value: workspace.totalChats, color: "#3b82f6" },
                    { icon: FileText, label: "Documents", value: workspace.totalDocuments, color: "#22c55e" },
                    { icon: Bot, label: "Agents", value: workspace.totalAgents, color: "#a855f7" },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                            style={{ backgroundColor: `${stat.color}15` }}
                        >
                            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                        </div>
                        <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
                        <p className="text-xs text-zinc-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="animate-slideUp opacity-0 animate-delay-200">
                <h2 className="text-lg font-semibold text-zinc-100 mb-4">
                    Recent Activity
                </h2>
                {recentActivity.length === 0 ? (
                    <div className="glass-card rounded-xl p-8 text-center">
                        <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500">No activity yet</p>
                        <p className="text-xs text-zinc-600 mt-1">
                            Start chatting, uploading documents, or configuring agents.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentActivity.map((item) => (
                            <div
                                key={item.id}
                                className="glass-card rounded-xl px-4 py-3 flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-zinc-300 truncate">
                                        {item.description}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 mt-0.5">
                                        {formatRelativeTime(item.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Future AI Modules */}
            <div className="animate-slideUp opacity-0 animate-delay-300">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-semibold text-zinc-100">
                        AI Modules
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-[10px] font-medium text-indigo-400">
                        <Sparkles className="w-3 h-3" />
                        Coming Soon
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {futureModules.map((module) => (
                        <div
                            key={module.title}
                            className="glass-card rounded-2xl p-5 relative overflow-hidden group"
                        >
                            <div
                                className={cn(
                                    "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br mb-3",
                                    module.gradient
                                )}
                            >
                                <module.icon className="w-5.5 h-5.5 text-zinc-300" />
                            </div>
                            <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                                {module.title}
                            </h3>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                {module.description}
                            </p>
                            <div className="absolute top-3 right-3">
                                <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] text-zinc-600 font-medium">
                                    SOON
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
