import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChats, ChatListItem } from "@/actions/chat";
import { Metadata } from "next";
import { ChatListClient } from "./chat-list-client";

export const metadata: Metadata = {
    title: "Chats — AI Workspace",
    description: "Manage your conversations in this workspace.",
};

interface PageProps {
    params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceChatPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const { workspaceId } = await params;

    let chats: ChatListItem[] = [];
    try {
        chats = await getChats(workspaceId);
    } catch (error) {
        console.error("Error fetching chats:", error);
    }

    return <ChatListClient workspaceId={workspaceId} chats={chats} />;
}
