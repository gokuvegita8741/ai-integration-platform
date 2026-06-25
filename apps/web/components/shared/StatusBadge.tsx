"use client";

import { cn } from "@/lib/utils";

type StatusType = "active" | "archived" | "pending" | "processing" | "ready" | "error" | "enabled" | "disabled" | "coming_soon";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
    active: {
        label: "Active",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    archived: {
        label: "Archived",
        className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    },
    pending: {
        label: "Pending",
        className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    processing: {
        label: "Processing",
        className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    ready: {
        label: "Ready",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    error: {
        label: "Error",
        className: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    enabled: {
        label: "Enabled",
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    disabled: {
        label: "Disabled",
        className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    },
    coming_soon: {
        label: "Coming Soon",
        className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
};

interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                config.className,
                className
            )}
        >
            {(status === "active" || status === "enabled" || status === "ready") && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            )}
            {(status === "processing") && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-spin" />
            )}
            {label || config.label}
        </span>
    );
}
