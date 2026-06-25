"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    Compass,
    Code,
    PenTool,
    BarChart3,
    Puzzle,
    Power,
    Trash2,
    MoreVertical,
    LucideIcon,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Agent } from "@/actions/agent";

interface AgentCardProps {
    agent: Agent;
    onToggle?: (agentId: string) => void | Promise<void>;
    onDelete?: (agentId: string) => void;
    className?: string;
}

const agentTypeConfig: Record<
    Agent["type"],
    { icon: LucideIcon; accentColor: string; label: string }
> = {
    research: { icon: Compass, accentColor: "#06b6d4", label: "Research" },
    coding: { icon: Code, accentColor: "#22c55e", label: "Coding" },
    writing: { icon: PenTool, accentColor: "#f97316", label: "Writing" },
    data: { icon: BarChart3, accentColor: "#3b82f6", label: "Data" },
    custom: { icon: Puzzle, accentColor: "#8b5cf6", label: "Custom" },
};

export function AgentCard({ agent, onToggle, onDelete, className }: AgentCardProps) {
    const [toggling, setToggling] = useState(false);
    const config = agentTypeConfig[agent.type] || agentTypeConfig.custom;
    const { icon: TypeIcon, accentColor, label: typeLabel } = config;

    const handleToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onToggle || toggling) return;

        setToggling(true);
        try {
            await onToggle(agent.id);
        } finally {
            setToggling(false);
        }
    };

    return (
        <div
            className={cn(
                "group relative glass-card rounded-xl p-5 card-hover overflow-hidden",
                className
            )}
        >
            {/* Accent border */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                style={{ backgroundColor: accentColor }}
            />

            {/* Background gradient glow */}
            <div
                className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${accentColor}, transparent 60%)`,
                }}
            />

            <div className="relative z-10">
                {/* Header: Icon + Name + Actions */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Type icon */}
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accentColor}15` }}
                    >
                        <TypeIcon className="w-5 h-5" style={{ color: accentColor }} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
                                {agent.name}
                            </h3>
                            {/* Status dot */}
                            <span
                                className={cn(
                                    "w-2 h-2 rounded-full shrink-0",
                                    agent.enabled
                                        ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                                        : "bg-zinc-600"
                                )}
                            />
                        </div>
                        {agent.description && (
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                                {agent.description}
                            </p>
                        )}
                    </div>

                    {/* Actions dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] transition-all duration-200 outline-none shrink-0">
                                <MoreVertical className="w-4 h-4 text-zinc-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="min-w-[140px] bg-zinc-900/95 backdrop-blur-2xl border-white/[0.08]"
                        >
                            {onToggle && (
                                <DropdownMenuItem
                                    onClick={() => onToggle(agent.id)}
                                    className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06] cursor-pointer"
                                >
                                    <Power className="w-4 h-4" />
                                    {agent.enabled ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                            )}
                            {onToggle && onDelete && (
                                <DropdownMenuSeparator className="bg-white/[0.06]" />
                            )}
                            {onDelete && (
                                <DropdownMenuItem
                                    onClick={() => onDelete(agent.id)}
                                    variant="destructive"
                                    className="cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Footer: Type badge + Toggle button */}
                <div className="flex items-center justify-between mt-4">
                    {/* Type badge */}
                    <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                        style={{
                            backgroundColor: `${accentColor}10`,
                            color: accentColor,
                            borderColor: `${accentColor}20`,
                        }}
                    >
                        <TypeIcon className="w-3 h-3" />
                        {typeLabel}
                    </span>

                    {/* Toggle button */}
                    {onToggle && (
                        <button
                            onClick={handleToggle}
                            disabled={toggling}
                            className={cn(
                                "relative w-10 h-5.5 rounded-full transition-all duration-300 outline-none",
                                agent.enabled
                                    ? "bg-emerald-500/20"
                                    : "bg-zinc-700/50"
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all duration-300",
                                    agent.enabled
                                        ? "left-5 bg-emerald-400 shadow-sm shadow-emerald-400/50"
                                        : "left-0.5 bg-zinc-500"
                                )}
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
