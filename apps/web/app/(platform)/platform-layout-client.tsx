"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { PlatformSidebar } from "@/components/platform/PlatformSidebar";
import { TopBar } from "@/components/platform/TopBar";
import { CommandPalette } from "@/components/platform/CommandPalette";
import type { Workspace } from "@/actions/workspace";

interface PlatformLayoutClientProps {
    workspaces: Workspace[];
    children: React.ReactNode;
}

export function PlatformLayoutClient({
    workspaces,
    children,
}: PlatformLayoutClientProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    const handleToggleCollapse = useCallback(() => {
        setSidebarCollapsed((prev) => !prev);
    }, []);

    const handleMobileOpen = useCallback(() => {
        setMobileOpen(true);
    }, []);

    const handleMobileClose = useCallback(() => {
        setMobileOpen(false);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden bg-[#09090b]">
            {/* Platform Sidebar */}
            <PlatformSidebar
                workspaces={workspaces}
                collapsed={sidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
                mobileOpen={mobileOpen}
                onMobileClose={handleMobileClose}
            />

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <TopBar
                    onToggleSidebar={handleMobileOpen}
                    onOpenCommandPalette={() => setCommandPaletteOpen(true)}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Command Palette (global) */}
            <CommandPalette
                open={commandPaletteOpen}
                onOpenChange={setCommandPaletteOpen}
            />
        </div>
    );
}
