"use client";

import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Boxes,
    Search,
    Settings,
    Plus,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Sparkles,
    X,
    BotIcon
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Workspace } from "@/actions/workspace";

interface PlatformSidebarProps {
    workspaces?: Workspace[];
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Workspaces", href: "/workspaces", icon: Boxes },
    { label: "Chatbot", href: "/chatbot", icon: BotIcon },
    { label: "Search", href: "/search", icon: Search },
    { label: "Settings", href: "/settings", icon: Settings },
];

export function PlatformSidebar({
    workspaces = [],
    collapsed = false,
    onToggleCollapse,
    mobileOpen = false,
    onMobileClose,
}: PlatformSidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const recentWorkspaces = workspaces.slice(0, 5);

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    const sidebarContent = (
        <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="px-4 py-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                    <Sparkles className="w-4.5 h-4.5" />
                </div>
                {!collapsed && (
                    <div className="animate-fadeIn">
                        <h1 className="font-bold text-sm text-white leading-tight">
                            AI Workspace
                        </h1>
                        <p className="text-[10px] text-zinc-500">Universal Platform</p>
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="px-3 space-y-1 mt-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onMobileClose}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                            isActive(item.href)
                                ? "bg-white/[0.08] text-white shadow-sm"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <item.icon
                            className={cn(
                                "w-4.5 h-4.5 shrink-0 transition-colors",
                                isActive(item.href)
                                    ? "text-indigo-400"
                                    : "text-zinc-500 group-hover:text-zinc-300"
                            )}
                        />
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>

            {/* Recent Workspaces */}
            {!collapsed && recentWorkspaces.length > 0 && (
                <div className="px-3 mt-8 animate-fadeIn">
                    <h3 className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                        Recent Workspaces
                    </h3>
                    <div className="space-y-0.5">
                        {recentWorkspaces.map((ws) => (
                            <Link
                                key={ws.id}
                                href={`/workspaces/${ws.id}`}
                                onClick={onMobileClose}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                    pathname.includes(ws.id)
                                        ? "bg-white/[0.06] text-zinc-200"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                                )}
                            >
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: ws.color || "#6366f1" }}
                                />
                                <span className="truncate">{ws.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Workspace Quick Button */}
            {!collapsed && (
                <div className="px-3 mt-4">
                    <Link href="/workspaces" onClick={onMobileClose}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] text-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            New Workspace
                        </Button>
                    </Link>
                </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Collapse Toggle */}
            <div className="px-3 py-2 hidden lg:block">
                <button
                    onClick={onToggleCollapse}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all duration-200"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-xs">Collapse</span>
                        </>
                    )}
                </button>
            </div>

            {/* User Section */}
            <div className="px-3 py-4 border-t border-white/[0.06]">
                <div className={cn(
                    "flex items-center gap-3",
                    collapsed && "justify-center"
                )}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">
                                {session?.user?.name || "User"}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">
                                {session?.user?.email || ""}
                            </p>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden animate-fadeIn"
                    onClick={onMobileClose}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full z-50 lg:hidden transition-transform duration-300 ease-out",
                    "w-[var(--sidebar-width)] glass-sidebar",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <button
                    onClick={onMobileClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                {sidebarContent}
            </aside>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col h-full glass-sidebar transition-all duration-300 ease-out shrink-0",
                    collapsed
                        ? "w-[var(--sidebar-collapsed-width)]"
                        : "w-[var(--sidebar-width)]"
                )}
            >
                {sidebarContent}
            </aside>
        </>
    );
}
