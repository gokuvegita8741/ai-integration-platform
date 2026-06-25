"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    Loader2,
    Compass,
    Code,
    PenTool,
    BarChart3,
    Puzzle,
    LucideIcon,
} from "lucide-react";
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
import { createAgent } from "@/actions/agent";
import type { Agent } from "@/actions/agent";
import { notifications } from "@mantine/notifications";

interface CreateAgentDialogProps {
    workspaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: (agent: Agent) => void;
}

const agentTypes: {
    type: Agent["type"];
    icon: LucideIcon;
    label: string;
    description: string;
    accentColor: string;
}[] = [
    {
        type: "research",
        icon: Compass,
        label: "Research",
        description: "Web research & information gathering",
        accentColor: "#06b6d4",
    },
    {
        type: "coding",
        icon: Code,
        label: "Coding",
        description: "Code generation, review & debugging",
        accentColor: "#22c55e",
    },
    {
        type: "writing",
        icon: PenTool,
        label: "Writing",
        description: "Content creation & editing",
        accentColor: "#f97316",
    },
    {
        type: "data",
        icon: BarChart3,
        label: "Data",
        description: "Data analysis & visualization",
        accentColor: "#3b82f6",
    },
    {
        type: "custom",
        icon: Puzzle,
        label: "Custom",
        description: "Custom agent with your own config",
        accentColor: "#8b5cf6",
    },
];

export function CreateAgentDialog({
    workspaceId,
    open,
    onOpenChange,
    onCreated,
}: CreateAgentDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedType, setSelectedType] = useState<Agent["type"]>("research");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;

        setLoading(true);
        try {
            const agent = await createAgent(workspaceId, {
                name: name.trim(),
                description: description.trim() || undefined,
                type: selectedType,
            });

            notifications.show({
                title: "Agent created",
                message: `"${agent.name}" is ready to use`,
                color: "green",
            });

            onOpenChange(false);
            resetForm();
            onCreated?.(agent);
        } catch (error: any) {
            notifications.show({
                title: "Failed to create agent",
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
        setSelectedType("research");
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                onOpenChange(v);
                if (!v) resetForm();
            }}
        >
            <DialogContent className="sm:max-w-[480px] bg-zinc-900/95 backdrop-blur-2xl border-white/[0.08]">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Create Agent</DialogTitle>
                    <DialogDescription>
                        Configure an AI agent for your workspace.
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
                            placeholder="My Research Agent"
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
                            placeholder="Describe what this agent should do..."
                            rows={3}
                            className="w-full rounded-md bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none resize-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                    </div>

                    {/* Type Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Type</label>
                        <div className="grid grid-cols-1 gap-2">
                            {agentTypes.map(
                                ({
                                    type,
                                    icon: Icon,
                                    label,
                                    description: desc,
                                    accentColor,
                                }) => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedType(type)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left",
                                            selectedType === type
                                                ? "border-white/[0.15] bg-white/[0.06] ring-1"
                                                : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08]"
                                        )}
                                        style={
                                            selectedType === type
                                                ? { boxShadow: `0 0 0 1px ${accentColor}40` }
                                                : undefined
                                        }
                                    >
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                            style={{
                                                backgroundColor: `${accentColor}15`,
                                            }}
                                        >
                                            <Icon
                                                className="w-4.5 h-4.5"
                                                style={{ color: accentColor }}
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-zinc-200">
                                                {label}
                                            </p>
                                            <p className="text-[11px] text-zinc-500 truncate">
                                                {desc}
                                            </p>
                                        </div>
                                        {/* Radio indicator */}
                                        <div
                                            className={cn(
                                                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                                selectedType === type
                                                    ? "border-current"
                                                    : "border-zinc-600"
                                            )}
                                            style={
                                                selectedType === type
                                                    ? { color: accentColor }
                                                    : undefined
                                            }
                                        >
                                            {selectedType === type && (
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor: accentColor,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onOpenChange(false);
                            resetForm();
                        }}
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
                            "Create Agent"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
