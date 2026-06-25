import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspaceActivity, type ActivityFeedPage } from "@/actions/activity";
import { Metadata } from "next";
import { ActivityClient } from "./activity-client";

export const metadata: Metadata = {
    title: "Activity — AI Workspace",
    description: "View all activity in your workspace.",
};

interface PageProps {
    params: Promise<{ workspaceId: string }>;
}

export default async function ActivityPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const { workspaceId } = await params;

    let activityPage: ActivityFeedPage = {
        activities: [],
        nextCursor: null,
        hasMore: false,
    };
    try {
        activityPage = await getWorkspaceActivity(workspaceId, { limit: 20 });
    } catch (error) {
        console.error("Error fetching activity:", error);
    }

    return <ActivityClient workspaceId={workspaceId} initialPage={activityPage} />;
}
