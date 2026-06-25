"use client";

import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    MessageSquare,
    FileText,
    Database,
    Bot,
    Activity,
    Settings,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { WorkspaceWithStats } from "@/actions/workspace";

interface WorkspaceSidebarProps {
    workspace: WorkspaceWithStats;
    className?: string;
}

const navItems = [
    { label: "Overview", href: "", icon: LayoutGrid },
    { label: "Chat", href: "/chat", icon: MessageSquare },
    { label: "Documents", href: "/documents", icon: FileText },
    { label: "Knowledge Base", href: "/knowledge", icon: Database },
    { label: "Agents", href: "/agents", icon: Bot },
    { label: "Activity", href: "/activity", icon: Activity },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function WorkspaceSidebar({ workspace, className }: WorkspaceSidebarProps) {
    const pathname = usePathname();
    const basePath = `/workspaces/${workspace.id}`;

    const isActive = (href: string) => {
        const fullPath = basePath + href;
        if (href === "") return pathname === basePath;
        return pathname.startsWith(fullPath);
    };

    const accentColor = workspace.color || "#6366f1";

    return (
        <div className={cn("w-56 shrink-0 py-4 pr-4", className)}>
            {/* Back */}
            <Link
                href="/workspaces"
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                All Workspaces
            </Link>

            {/* Workspace Header */}
            <div className="flex items-center gap-2.5 px-3 mb-6">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: `${accentColor}20` }}
                >
                    {workspace.icon || workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-zinc-200 truncate">
                        {workspace.name}
                    </h2>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="space-y-0.5">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={basePath + item.href}
                        className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                            isActive(item.href)
                                ? "bg-white/[0.06] text-zinc-100 font-medium"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                        )}
                    >
                        <item.icon
                            className={cn(
                                "w-4 h-4 shrink-0",
                                isActive(item.href) ? "text-indigo-400" : "text-zinc-600"
                            )}
                        />
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
