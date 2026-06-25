"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMain } from "./ChatMain";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { createChat, deleteChat, renameChat, ChatListItem } from "@/actions/chat";

interface ChatLayoutProps {
    initialChats: ChatListItem[];
    activeChatId?: string | null;
    initialMessages?: Array<{
        id: string;
        role: "user" | "assistant";
        content: string;
        createdAt: number;
    }>;
    initialChatName?: string;
    workspaceId?: string;
}

export function ChatLayout({
    initialChats,
    activeChatId = null,
    initialMessages = [],
    initialChatName = "New Chat",
    workspaceId
}: ChatLayoutProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Chat State (local, derived from server data)
    const [chats, setChats] = useState<ChatListItem[]>(initialChats);
    const [currentChatName, setCurrentChatName] = useState(initialChatName);

    // Handle creating a new chat
    const handleCreateChat = async () => {
        try {
            const result = workspaceId ? await createChat(workspaceId) : await createChat();
            // Add to local state
            setChats((prev) => [
                { id: result.chatId, name: result.name, createdAt: new Date().toISOString() },
                ...prev,
            ]);
            // Navigate to new chat
            if(workspaceId){
                router.push(`/workspaces/${workspaceId}/chat/${result.chatId}`)
            }else{
                router.push(`/chatbot/${result.chatId}`);
            }
        } catch (error) {
            console.error("Failed to create chat:", error);
        }
    };

    // Handle selecting a chat
    const handleSelectChat = (chatId: string) => {
        setIsMobileMenuOpen(false);
        if(workspaceId){
            router.push(`/workspaces/${workspaceId}/chat/${chatId}`);
        }else{
            router.push(`/chatbot/${chatId}`);
        }
    };

    // Handle renaming a chat
    const handleRenameChat = async (chatId: string, newName: string) => {
        try {
            await renameChat(chatId, newName);
            setChats((prev) =>
                prev.map((chat) => (chat.id === chatId ? { ...chat, name: newName } : chat))
            );
            if (chatId === activeChatId) {
                setCurrentChatName(newName);
            }
        } catch (error) {
            console.error("Failed to rename chat:", error);
        }
    };

    // Handle deleting a chat
    const handleDeleteChat = async (chatId: string) => {
        try {
            await deleteChat(chatId);
            setChats((prev) => prev.filter((chat) => chat.id !== chatId));
            // If deleted the active chat, navigate to base
            if (chatId === activeChatId) {
                if(workspaceId){
                    router.push(`/workspaces/${workspaceId}/chat/${chatId}`)
                }else{
                    router.push("/chatbot");
                }
            }
        } catch (error) {
            console.error("Failed to delete chat:", error);
        }
    };

    // Handle chat name update from streaming (when first message is sent)
    const handleChatNameUpdate = (newName: string) => {
        if (activeChatId) {
            setChats((prev) =>
                prev.map((chat) => (chat.id === activeChatId ? { ...chat, name: newName } : chat))
            );
            setCurrentChatName(newName);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-black">
            {/* Desktop Sidebar */}
            <div
                className={`
                    hidden md:block 
                    transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? "w-[280px]" : "w-0 opacity-0 overflow-hidden"}
                `}
            >
                <ChatSidebar
                    chats={chats}
                    activeChatId={activeChatId}
                    onCreateChat={handleCreateChat}
                    onSelectChat={handleSelectChat}
                    onRenameChat={handleRenameChat}
                    onDeleteChat={handleDeleteChat}
                    isPending={isPending}
                />
            </div>

            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-[280px] border-r-zinc-800 bg-black">
                    <VisuallyHidden>
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </VisuallyHidden>
                    <ChatSidebar
                        chats={chats}
                        activeChatId={activeChatId}
                        onCreateChat={handleCreateChat}
                        onSelectChat={handleSelectChat}
                        onRenameChat={handleRenameChat}
                        onDeleteChat={handleDeleteChat}
                        isPending={isPending}
                    />
                </SheetContent>
            </Sheet>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <ChatMain
                    chatId={activeChatId}
                    chatName={currentChatName}
                    initialMessages={initialMessages}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                    onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
                    onChatNameUpdate={handleChatNameUpdate}
                />
            </div>
        </div>
    );
}
