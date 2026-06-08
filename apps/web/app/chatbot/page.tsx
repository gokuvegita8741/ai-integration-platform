import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatLayout } from "@/components/chatbot/ChatLayout";
import { getChats, ChatListItem } from "@/actions/chat";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Chatbot - QuickGPT",
    description: "AI-powered chat assistant",
};

export default async function ChatbotPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    // Fetch initial chats for the sidebar
    let chats: ChatListItem[] = [];
    try {
        chats = await getChats();
    } catch (error) {
        console.error("Error fetching chats:", error);
        // Continue with empty chats - user can create new ones
    }

    return (
        <ChatLayout
            initialChats={chats}
            activeChatId={null}
        />
    );
}
