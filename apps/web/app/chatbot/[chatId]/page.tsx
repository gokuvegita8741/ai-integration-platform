import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatLayout } from "@/components/chatbot/ChatLayout";
import { getChats, getChat } from "@/actions/chat";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ chatId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { chatId } = await params;
    return {
        title: `Chat - QuickGPT`,
        description: "AI-powered chat assistant",
    };
}

export default async function ChatPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const { chatId } = await params;

    try {
        // Fetch chats list and current chat data in parallel
        const [chats, chatDetail] = await Promise.all([
            getChats(),
            getChat(chatId),
        ]);

        // Transform messages to the format ChatMain expects
        const initialMessages = chatDetail.messages.map((msg) => ({
            id: msg.id,
            role: msg.sender as "user" | "assistant",
            content: msg.message,
            createdAt: new Date(msg.createdAt).getTime(),
        }));

        return (
            <ChatLayout
                initialChats={chats}
                activeChatId={chatId}
                initialMessages={initialMessages}
                initialChatName={chatDetail.name}
            />
        );
    } catch (error) {
        console.error("Error loading chat:", error);
        // If chat not found, redirect to base chatbot page
        redirect("/chatbot");
    }
}
