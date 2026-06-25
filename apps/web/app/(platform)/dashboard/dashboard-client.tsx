"use client";

import { Boxes, MessageSquare, FileText, Bot, Sparkles } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentWorkspaces } from "@/components/dashboard/RecentWorkspaces";
import { RecentChats } from "@/components/dashboard/RecentChats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import type { DashboardData } from "@/actions/dashboard";
import RecentActivity from "@/components/dashboard/RecentActivity";

interface DashboardClientProps {
    userName: string;
    dashboardData: DashboardData | null;
}

export function DashboardClient({ userName, dashboardData }: DashboardClientProps) {
    const stats = dashboardData?.stats || {
        totalWorkspaces: 0,
        totalChats: 0,
        totalDocuments: 0,
        totalAgents: 0,
    };

    return (
        <div className="space-y-8">
            {/* Greeting */}
            <div className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-1">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs text-indigo-400 font-medium uppercase tracking-widest">
                        Dashboard
                    </span>
                </div>
                <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
                    Welcome back,{" "}
                    <span className="gradient-text">{userName}</span>
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Here&apos;s an overview of your AI workspace activity.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="animate-slideUp opacity-0 animate-delay-100">
                    <StatCard
                        icon={Boxes}
                        label="Workspaces"
                        value={stats.totalWorkspaces}
                        accentColor="#6366f1"
                    />
                </div>
                <div className="animate-slideUp opacity-0 animate-delay-200">
                    <StatCard
                        icon={MessageSquare}
                        label="Chats"
                        value={stats.totalChats}
                        accentColor="#3b82f6"
                    />
                </div>
                <div className="animate-slideUp opacity-0 animate-delay-300">
                    <StatCard
                        icon={FileText}
                        label="Documents"
                        value={stats.totalDocuments}
                        accentColor="#22c55e"
                    />
                </div>
                <div className="animate-slideUp opacity-0 animate-delay-400">
                    <StatCard
                        icon={Bot}
                        label="Agents"
                        value={stats.totalAgents}
                        accentColor="#a855f7"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="animate-slideUp opacity-0 animate-delay-300">
                <QuickActions />
            </div>

            {/* Recent Workspaces */}
            <div className="animate-slideUp opacity-0 animate-delay-400">
                <RecentWorkspaces
                    workspaces={dashboardData?.recentWorkspaces || []}
                />
            </div>

            {/* Two Column: Recent Chats + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideUp opacity-0 animate-delay-500">
                <RecentChats
                    chats={dashboardData?.recentChats || []}
                />

                <RecentActivity
                    activity={dashboardData?.recentActivity || []}
                />
            </div>
        </div>
    );
}
