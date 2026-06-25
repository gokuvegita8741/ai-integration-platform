import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChats, getChat } from "@/actions/chat";
import { ChatLayout } from "@/components/chatbot/ChatLayout";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ workspaceId: string; chatId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
        title: "Chat — AI Workspace",
        description: "AI-powered conversation within your workspace",
    };
}

export default async function WorkspaceChatDetailPage({ params }: PageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const { workspaceId, chatId } = await params;

    try {
        const [chats, chatDetail] = await Promise.all([
            getChats(),
            getChat(chatId),
        ]);

        const initialMessages = chatDetail.messages.map((msg) => ({
            id: msg.id,
            role: msg.sender as "user" | "assistant",
            content: msg.content,
            createdAt: new Date(msg.createdAt).getTime(),
            sequence: msg.sequence,
            parentVersionId: msg.parentVersionId,
            versions: msg.versions,
            activeVersionNumber: msg.activeVersionNumber,
            totalVersions: msg.totalVersions,
        }));

        return (
            <div className="-m-4 lg:-m-6">
                <ChatLayout
                    initialChats={chats}
                    activeChatId={chatId}
                    initialMessages={initialMessages}
                    initialChatName={chatDetail.name}
                    workspaceId={workspaceId}
                />
            </div>
        );
    } catch (error) {
        console.error("Error loading chat:", error);
        redirect(`/workspaces/${workspaceId}/chat`);
    }
}
