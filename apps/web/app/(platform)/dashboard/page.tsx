import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/actions/dashboard";
import { DashboardClient } from "./dashboard-client";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard — AI Workspace",
    description: "Your AI workspace dashboard — manage workspaces, chats, documents, and agents.",
};

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    let dashboardData = null;
    try {
        dashboardData = await getDashboardData();
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }

    const userName = session.user?.name || "User";

    return (
        <DashboardClient
            userName={userName}
            dashboardData={dashboardData}
        />
    );
}
