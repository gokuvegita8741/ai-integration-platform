"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { createWorkspace } from "@/actions/workspace";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

interface CreateWorkspaceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const presetColors = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
    "#f97316", "#eab308", "#22c55e", "#14b8a6",
    "#06b6d4", "#3b82f6", "#a855f7", "#64748b",
];

const presetIcons = [
    "🚀", "💡", "📊", "🎨", "🔬", "📝",
    "🤖", "🎯", "⚡", "🌟", "🔮", "🧠",
    "📁", "🎮", "🏗️", "💻", "📈", "🔧",
];

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("🚀");
    const [selectedColor, setSelectedColor] = useState(presetColors[0]);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;

        setLoading(true);
        try {
            const workspace = await createWorkspace({
                name: name.trim(),
                description: description.trim() || undefined,
                icon: selectedIcon,
                color: selectedColor,
            });

            console.log("Workspace created:", JSON.stringify(workspace));

            notifications.show({
                title: "Workspace created",
                message: `"${workspace.name}" is ready to use`,
                color: "green",
            });

            onOpenChange(false);
            resetForm();
            router.push(`/workspaces/${workspace.id}`);
            router.refresh();
        } catch (error: any) {
            notifications.show({
                title: "Failed to create workspace",
                message: error.message || "Please try again",
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setSelectedIcon("🚀");
        setSelectedColor(presetColors[0]);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
            <DialogContent className="sm:max-w-[480px] bg-zinc-900/95 backdrop-blur-2xl border-white/[0.08]">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Create Workspace</DialogTitle>
                    <DialogDescription>
                        Set up a new workspace for your AI projects.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">
                            Name <span className="text-red-400">*</span>
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My AI Project"
                            className="bg-white/[0.04] border-white/[0.08] focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/10"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this workspace is for..."
                            rows={3}
                            className="w-full rounded-md bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none resize-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                    </div>

                    {/* Icon Picker */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Icon</label>
                        <div className="grid grid-cols-9 gap-1.5">
                            {presetIcons.map((icon) => (
                                <button
                                    key={icon}
                                    onClick={() => setSelectedIcon(icon)}
                                    className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all",
                                        selectedIcon === icon
                                            ? "bg-white/[0.1] ring-2 ring-indigo-500/50 scale-110"
                                            : "bg-white/[0.03] hover:bg-white/[0.06]"
                                    )}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Color</label>
                        <div className="flex gap-2 flex-wrap">
                            {presetColors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "w-7 h-7 rounded-full transition-all",
                                        selectedColor === color
                                            ? "ring-2 ring-offset-2 ring-offset-zinc-900 scale-110"
                                            : "hover:scale-110"
                                    )}
                                    style={{
                                        backgroundColor: color,
                                        ringColor: color,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => { onOpenChange(false); resetForm(); }}
                        className="text-zinc-400"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!name.trim() || loading}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Workspace"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
