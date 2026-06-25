"use client";

import { cn } from "@/lib/utils";
import { Menu, Search, Command } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface Breadcrumb {
    label: string;
    href?: string;
}

interface TopBarProps {
    breadcrumbs?: Breadcrumb[];
    onToggleSidebar?: () => void;
    onOpenCommandPalette?: () => void;
    className?: string;
}

export function TopBar({
    breadcrumbs,
    onToggleSidebar,
    onOpenCommandPalette,
    className,
}: TopBarProps) {
    const { data: session } = useSession();

    return (
        <header
            className={cn(
                "h-[var(--header-height)] flex items-center justify-between px-4 lg:px-6 glass-topbar shrink-0 z-30",
                className
            )}
        >
            {/* Left: Sidebar Toggle + Breadcrumbs */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors lg:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="hidden sm:flex items-center gap-1 text-sm">
                        {breadcrumbs.map((crumb, i) => (
                            <div key={i} className="flex items-center gap-1">
                                {i > 0 && (
                                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                                )}
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-zinc-300">{crumb.label}</span>
                                )}
                            </div>
                        ))}
                    </nav>
                )}
            </div>

            {/* Right: Search + Avatar */}
            <div className="flex items-center gap-2">
                {/* Cmd+K Search Trigger */}
                <button
                    onClick={onOpenCommandPalette}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all text-sm"
                >
                    <Search className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">Search</span>
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-zinc-500 font-mono">
                        <Command className="w-2.5 h-2.5" />K
                    </kbd>
                </button>

                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:shadow-lg hover:shadow-indigo-500/20 transition-all">
                    {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
            </div>
        </header>
    );
}
