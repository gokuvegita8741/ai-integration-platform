"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ActivityTimeline } from "@/components/activity/ActivityTimeline";
import { getWorkspaceActivity, type ActivityFeedPage, type ActivityItem } from "@/actions/activity";

interface ActivityClientProps {
    workspaceId: string;
    initialPage: ActivityFeedPage;
}

export function ActivityClient({ workspaceId, initialPage }: ActivityClientProps) {
    const [activities, setActivities] = useState<ActivityItem[]>(initialPage.activities);
    const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
    const [hasMore, setHasMore] = useState(initialPage.hasMore);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLoadMore = useCallback(async () => {
        if (loading || !hasMore || !nextCursor) return;

        setLoading(true);
        setError(null);
        try {
            const page = await getWorkspaceActivity(workspaceId, {
                limit: 20,
                cursor: nextCursor,
            });
            setActivities((prev) => {
                const existing = new Set(prev.map((activity) => activity.id));
                const next = page.activities.filter((activity) => !existing.has(activity.id));
                return [...prev, ...next];
            });
            setNextCursor(page.nextCursor);
            setHasMore(page.hasMore);
        } catch (error) {
            console.error("Error loading more activity:", error);
            setError(error instanceof Error ? error.message : "Failed to load activity");
        } finally {
            setLoading(false);
        }
    }, [workspaceId, loading, hasMore, nextCursor]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Activity"
                description="Track all actions and changes in this workspace."
            />

            <ActivityTimeline
                activities={activities}
                loading={loading}
                hasMore={hasMore}
                error={error}
                onLoadMore={handleLoadMore}
            />
        </div>
    );
}
