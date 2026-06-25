import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = {
    title: "Settings — AI Workspace",
    description: "Manage your account settings, appearance, and AI preferences.",
};

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <SettingsClient
            userName={session.user?.name || "User"}
            userEmail={session.user?.email || ""}
        />
    );
}
