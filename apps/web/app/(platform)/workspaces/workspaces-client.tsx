"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Plus, Boxes, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/SearchInput";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import type { Workspace } from "@/actions/workspace";

interface WorkspacesClientProps {
    initialWorkspaces: Workspace[];
}

const statusFilters = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
];

const sortOptions = [
    { label: "Recent Activity", value: "lastActivityAt" },
    { label: "Name", value: "name" },
    { label: "Created", value: "createdAt" },
];

export function WorkspacesClient({ initialWorkspaces }: WorkspacesClientProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("lastActivityAt");
    const [createOpen, setCreateOpen] = useState(false);

    const filteredWorkspaces = useMemo(() => {
        let result = initialWorkspaces;

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter((ws) => ws.status === statusFilter);
        }

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (ws) =>
                    ws.name.toLowerCase().includes(q) ||
                    ws.description?.toLowerCase().includes(q)
            );
        }

        // Sort
        result = [...result].sort((a, b) => {
            if (sortBy === "name") {
                return a.name.localeCompare(b.name);
            }
            if (sortBy === "createdAt") {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            // lastActivityAt
            const aTime = new Date(a.lastActivityAt || a.updatedAt).getTime();
            const bTime = new Date(b.lastActivityAt || b.updatedAt).getTime();
            return bTime - aTime;
        });

        return result;
    }, [initialWorkspaces, search, statusFilter, sortBy]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Workspaces"
                description="Organize your AI projects, documents, and agents in dedicated workspaces."
                actions={
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Workspace
                    </Button>
                }
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search workspaces..."
                    className="w-full sm:w-72"
                />

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                    statusFilter === filter.value
                                        ? "bg-white/[0.08] text-zinc-100"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none pl-8 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-400 outline-none cursor-pointer hover:bg-white/[0.06] transition-colors"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-zinc-900">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Workspaces Grid */}
            {filteredWorkspaces.length === 0 ? (
                <EmptyState
                    icon={Boxes}
                    title={search ? "No matching workspaces" : "No workspaces yet"}
                    description={
                        search
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Create your first workspace to organize your AI projects, documents, and agents."
                    }
                    actionLabel={!search ? "Create Workspace" : undefined}
                    onAction={!search ? () => setCreateOpen(true) : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredWorkspaces.map((ws, i) => (
                        <div
                            key={ws.id}
                            className={cn(
                                "animate-slideUp opacity-0",
                                `animate-delay-${Math.min((i + 1) * 100, 500)}`
                            )}
                        >
                            <WorkspaceCard workspace={ws} />
                        </div>
                    ))}
                </div>
            )}

            {/* Create Workspace Dialog */}
            <CreateWorkspaceDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
            />
        </div>
    );
}
