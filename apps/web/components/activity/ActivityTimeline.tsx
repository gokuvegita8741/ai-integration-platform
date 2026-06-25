"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    FileText,
    Bot,
    Boxes,
    Settings,
    Trash2,
    Clock,
    LucideIcon,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActivityItem } from "@/actions/activity";
import {
    formatActivityTime,
    getActivityDateGroup,
    getActivitySentence,
    getActivityTitle,
    getMetadataEntries,
} from "@/lib/activity-format";

interface ActivityTimelineProps {
    activities: ActivityItem[];
    loading?: boolean;
    hasMore?: boolean;
    error?: string | null;
    onLoadMore?: () => void;
    className?: string;
}

interface ActionConfig {
    icon: LucideIcon;
    color: string;
    bgColor: string;
    dotColor: string;
}

function getActionConfig(activity: ActivityItem): ActionConfig {
    switch (activity.action) {
        case "chat_created":
            return {
                icon: MessageSquare,
                color: "text-indigo-400",
                bgColor: "bg-indigo-500/10",
                dotColor: "bg-indigo-400",
            };
        case "document_uploaded":
            return {
                icon: FileText,
                color: "text-emerald-400",
                bgColor: "bg-emerald-500/10",
                dotColor: "bg-emerald-400",
            };
        case "workspace_created":
            return {
                icon: Boxes,
                color: "text-purple-400",
                bgColor: "bg-purple-500/10",
                dotColor: "bg-purple-400",
            };
        case "workspace_updated":
            return {
                icon: Settings,
                color: "text-amber-400",
                bgColor: "bg-amber-500/10",
                dotColor: "bg-amber-400",
            };
        case "document_deleted":
            return {
                icon: Trash2,
                color: "text-red-400",
                bgColor: "bg-red-500/10",
                dotColor: "bg-red-400",
            };
        case "chat_deleted":
            return {
                icon: Trash2,
                color: "text-red-400",
                bgColor: "bg-red-500/10",
                dotColor: "bg-red-400",
            };
        default:
            if (activity.entityType === "chat") {
                return {
                    icon: MessageSquare,
                    color: "text-indigo-400",
                    bgColor: "bg-indigo-500/10",
                    dotColor: "bg-indigo-400",
                };
            }
            if (activity.entityType === "document") {
                return {
                    icon: FileText,
                    color: "text-emerald-400",
                    bgColor: "bg-emerald-500/10",
                    dotColor: "bg-emerald-400",
                };
            }
            if (activity.entityType === "agent") {
                return {
                    icon: Bot,
                    color: "text-cyan-400",
                    bgColor: "bg-cyan-500/10",
                    dotColor: "bg-cyan-400",
                };
            }
            if (activity.entityType === "workspace") {
                return {
                    icon: Boxes,
                    color: "text-purple-400",
                    bgColor: "bg-purple-500/10",
                    dotColor: "bg-purple-400",
                };
            }
            return {
                icon: Settings,
                color: "text-zinc-400",
                bgColor: "bg-zinc-500/10",
                dotColor: "bg-zinc-400",
            };
    }
}

// Animation delay classes for staggered fade-in
const delayClasses = [
    "delay-0",
    "delay-75",
    "delay-100",
    "delay-150",
    "delay-200",
    "delay-300",
    "delay-500",
    "delay-700",
];

function getDelayClass(index: number): string {
    return delayClasses[Math.min(index, delayClasses.length - 1)];
}

export function ActivityTimeline({
    activities,
    loading = false,
    hasMore = false,
    error,
    onLoadMore,
    className,
}: ActivityTimelineProps) {
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const groupedActivities = useMemo(() => {
        return activities.reduce<Record<string, ActivityItem[]>>((groups, activity) => {
            const group = getActivityDateGroup(activity.createdAt);
            groups[group] = groups[group] ?? [];
            groups[group].push(activity);
            return groups;
        }, {});
    }, [activities]);

    useEffect(() => {
        if (!onLoadMore || !hasMore || loading) return;

        const target = loadMoreRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onLoadMore();
                }
            },
            { rootMargin: "240px 0px" }
        );

        observer.observe(target);
        return () => observer.disconnect();
    }, [hasMore, loading, onLoadMore]);

    if (loading && activities.length === 0) {
        return (
            <div className={cn("space-y-3", className)}>
                {[0, 1, 2].map((item) => (
                    <div key={item} className="flex items-start gap-4 py-3 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
                        <div className="flex-1 pt-1.5 space-y-2">
                            <div className="h-4 w-2/3 rounded bg-white/[0.06]" />
                            <div className="h-3 w-1/4 rounded bg-white/[0.04]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!loading && activities.length === 0) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-12 animate-fadeIn", className)}>
                <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100 mb-1">
                        No activity yet
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Activity will appear here as you create chats, upload documents, and configure agents.
                    </p>
                    {error && (
                        <p className="mt-3 text-xs text-red-400">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative", className)}>
            {/* Vertical timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent" />

            <div className="space-y-6">
                {Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
                    <section key={dateGroup} className="relative">
                        <div className="sticky top-0 z-20 -ml-1 mb-2 bg-zinc-950/80 py-2 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
                            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-400">
                                {dateGroup}
                            </span>
                        </div>

                        <div className="space-y-1">
                            {groupActivities.map((activity, index) => {
                                const config = getActionConfig(activity);
                                const { icon: ActionIcon } = config;
                                const metadataEntries = getMetadataEntries(activity);
                                const globalIndex = activities.findIndex((item) => item.id === activity.id);

                                return (
                                    <div
                                        key={activity.id}
                                        className={cn(
                                            "relative flex items-start gap-4 py-3 pl-0 pr-2 animate-fadeIn",
                                            `animation-${getDelayClass(globalIndex)}`
                                        )}
                                        style={{
                                            animationDelay: `${Math.min(globalIndex * 50, 400)}ms`,
                                            animationFillMode: "both",
                                        }}
                                    >
                                        {/* Timeline dot + icon */}
                                        <div className="relative z-10 shrink-0">
                                            <div
                                                className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                                    config.bgColor
                                                )}
                                            >
                                                <ActionIcon className={cn("w-4 h-4", config.color)} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1 pt-1">
                                            <div className="flex min-w-0 items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-zinc-200 leading-snug">
                                                        {getActivityTitle(activity)}
                                                    </p>
                                                    {activity.entityName && (
                                                        <p className="mt-0.5 truncate text-sm text-zinc-400">
                                                            {activity.entityName}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="shrink-0 pt-0.5 text-[11px] text-zinc-600">
                                                    {formatActivityTime(activity.createdAt)}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs text-zinc-500">
                                                {getActivitySentence(activity)}
                                            </p>

                                            {metadataEntries.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    {metadataEntries.map((entry) => (
                                                        <span
                                                            key={`${activity.id}-${entry.label}`}
                                                            className="max-w-full truncate rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[11px] text-zinc-500"
                                                        >
                                                            <span className="text-zinc-600">{entry.label}: </span>
                                                            {entry.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>

            {error && (
                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    {error}
                </div>
            )}

            <div ref={loadMoreRef} className="h-1" />

            {/* Loading indicator */}
            {loading && activities.length > 0 && (
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
            )}

            {/* Load more fallback */}
            {onLoadMore && hasMore && !loading && activities.length > 0 && (
                <div className="flex items-center justify-center pt-4">
                    <Button
                        onClick={onLoadMore}
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] text-xs"
                    >
                        Load more
                    </Button>
                </div>
            )}

            {!hasMore && activities.length > 0 && (
                <div className="flex items-center justify-center pt-5">
                    <span className="text-[11px] text-zinc-700">You are all caught up</span>
                </div>
            )}
        </div>
    );
}