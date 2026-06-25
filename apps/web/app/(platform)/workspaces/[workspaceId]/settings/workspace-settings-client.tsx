"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Settings,
    Save,
    Loader2,
    Shield,
    Brain,
    Database,
    Bot,
    AlertTriangle,
    Archive,
    Trash2,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import {
    updateWorkspace,
    archiveWorkspace,
    deleteWorkspace,
    type WorkspaceWithStats,
} from "@/actions/workspace";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface WorkspaceSettingsClientProps {
    workspace: WorkspaceWithStats;
}

const WORKSPACE_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#06b6d4", "#3b82f6", "#a855f7", "#64748b",
];

const comingSoonSections = [
    { icon: Shield, title: "Permissions", description: "Control who can access and modify this workspace." },
    { icon: Brain, title: "AI Configuration", description: "Configure AI models, temperature, and system prompts." },
    { icon: Database, title: "Knowledge Settings", description: "Configure RAG, embeddings, and retrieval parameters." },
    { icon: Bot, title: "Agent Settings", description: "Default agent configurations and behavior rules." },
];

export function WorkspaceSettingsClient({ workspace }: WorkspaceSettingsClientProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState(workspace.name);
    const [description, setDescription] = useState(workspace.description || "");
    const [color, setColor] = useState(workspace.color || "#6366f1");
    const [icon, setIcon] = useState(workspace.icon || "");
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await updateWorkspace(workspace.id, {
                name: name.trim(),
                description: description.trim() || undefined,
                color,
                icon: icon.trim() || undefined,
            });
            notifications.show({
                title: "Settings saved",
                message: "Workspace settings updated successfully",
                color: "green",
            });
        } catch (error: any) {
            notifications.show({
                title: "Save failed",
                message: error.message || "Please try again",
                color: "red",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async () => {
        setActionLoading(true);
        try {
            await archiveWorkspace(workspace.id);
            notifications.show({
                title: "Workspace archived",
                message: "The workspace has been archived",
                color: "green",
            });
            router.push("/workspaces");
        } catch (error: any) {
            notifications.show({
                title: "Archive failed",
                message: error.message || "Please try again",
                color: "red",
            });
        } finally {
            setActionLoading(false);
            setArchiveDialogOpen(false);
        }
    };

    const handleDelete = async () => {
        setActionLoading(true);
        try {
            await deleteWorkspace(workspace.id);
            notifications.show({
                title: "Workspace deleted",
                message: "The workspace has been permanently deleted",
                color: "green",
            });
            router.push("/workspaces");
        } catch (error: any) {
            notifications.show({
                title: "Delete failed",
                message: error.message || "Please try again",
                color: "red",
            });
        } finally {
            setActionLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <PageHeader
                title="Settings"
                description="Configure your workspace settings and preferences."
            />

            {/* Workspace Details */}
            <div className="glass-card rounded-2xl p-6 animate-slideUp opacity-0 animate-delay-100">
                <h3 className="text-sm font-semibold text-zinc-200 mb-5 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-indigo-400" />
                    Workspace Details
                </h3>

                <div className="space-y-4">
                    <div>
                        <Label className="text-xs text-zinc-400 mb-1.5 block">Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="glass-input rounded-lg text-sm text-zinc-200 bg-transparent"
                            placeholder="Workspace name"
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-zinc-400 mb-1.5 block">Description</Label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full glass-input rounded-lg text-sm text-zinc-200 bg-transparent px-3 py-2 resize-none focus:outline-none"
                            placeholder="Describe what this workspace is for..."
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-zinc-400 mb-1.5 block">Icon (emoji)</Label>
                        <Input
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="glass-input rounded-lg text-sm text-zinc-200 bg-transparent w-20"
                            placeholder="🚀"
                            maxLength={2}
                        />
                    </div>

                    <div>
                        <Label className="text-xs text-zinc-400 mb-2 block">Color</Label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {WORKSPACE_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "w-8 h-8 rounded-lg transition-all duration-200",
                                        color === c
                                            ? "ring-2 ring-white/30 scale-110"
                                            : "hover:scale-105"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleSave}
                            disabled={saving || !name.trim()}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/20"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>

            {/* Coming Soon Sections */}
            {comingSoonSections.map((section, i) => {
                const SectionIcon = section.icon;
                return (
                    <div
                        key={section.title}
                        className={cn(
                            "glass-card rounded-2xl p-6 animate-slideUp opacity-0",
                            `animate-delay-${Math.min((i + 2) * 100, 500)}`
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                                    <SectionIcon className="w-4.5 h-4.5 text-zinc-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-300">
                                        {section.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {section.description}
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] text-[9px] text-zinc-500 font-medium shrink-0">
                                <Sparkles className="w-2.5 h-2.5" />
                                SOON
                            </span>
                        </div>
                    </div>
                );
            })}

            {/* Danger Zone */}
            <div className="glass-card rounded-2xl p-6 border border-red-500/10 animate-slideUp opacity-0 animate-delay-500">
                <h3 className="text-sm font-semibold text-red-400 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Zone
                </h3>
                <p className="text-xs text-zinc-500 mb-5">
                    These actions are irreversible. Please proceed with caution.
                </p>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setArchiveDialogOpen(true)}
                        className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                    >
                        <Archive className="w-3.5 h-3.5 mr-2" />
                        Archive Workspace
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteDialogOpen(true)}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete Workspace
                    </Button>
                </div>
            </div>

            {/* Archive Confirmation Dialog */}
            <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <DialogContent className="bg-zinc-900/95 backdrop-blur-2xl border-white/[0.08]">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Archive Workspace</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Are you sure you want to archive &ldquo;{workspace.name}&rdquo;? You can restore it later from the workspaces page.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setArchiveDialogOpen(false)}
                            className="text-zinc-400 hover:text-zinc-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleArchive}
                            disabled={actionLoading}
                            className="bg-amber-600 hover:bg-amber-500 text-white"
                        >
                            {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Archive
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-zinc-900/95 backdrop-blur-2xl border-white/[0.08]">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100">Delete Workspace</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            This action is permanent. All chats, documents, agents, and activity in &ldquo;{workspace.name}&rdquo; will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="text-zinc-400 hover:text-zinc-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={actionLoading}
                            className="bg-red-600 hover:bg-red-500 text-white"
                        >
                            {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
