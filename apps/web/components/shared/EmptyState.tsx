"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 px-6 animate-fadeIn",
                className
            )}
        >
            <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 animate-float">
                    <Icon className="w-8 h-8 text-indigo-400" />
                </div>

                <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                    {description}
                </p>

                {actionLabel && onAction && (
                    <Button
                        onClick={onAction}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/20 transition-all duration-200"
                    >
                        {actionLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
