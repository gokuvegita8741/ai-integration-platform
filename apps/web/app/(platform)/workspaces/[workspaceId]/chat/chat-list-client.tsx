"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    Plus,
    Clock,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/shared/SearchInput";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { createChat, type ChatListItem } from "@/actions/chat";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

interface ChatListClientProps {
    workspaceId: string;
    chats: ChatListItem[];
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export function ChatListClient({ workspaceId, chats }: ChatListClientProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [creating, setCreating] = useState(false);

    const filteredChats = search.trim()
        ? chats.filter((c) =>
              c.name.toLowerCase().includes(search.toLowerCase())
          )
        : chats;

    const handleCreateChat = async () => {
        setCreating(true);
        try {
            const result = await createChat(workspaceId);
            router.push(`/workspaces/${workspaceId}/chat/${result.chatId}`);
        } catch (error: any) {
            notifications.show({
                title: "Failed to create chat",
                message: error.message || "Please try again",
                color: "red",
            });
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Chats"
                description="Your conversations in this workspace."
                actions={
                    <Button
                        onClick={handleCreateChat}
                        disabled={creating}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/20"
                    >
                        {creating ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        New Chat
                    </Button>
                }
            />

            <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search chats..."
                className="max-w-sm"
            />

            {filteredChats.length === 0 ? (
                <EmptyState
                    icon={MessageSquare}
                    title={search ? "No matching chats" : "No chats yet"}
                    description={
                        search
                            ? "Try adjusting your search to find what you're looking for."
                            : "Start a new conversation to explore AI capabilities."
                    }
                    actionLabel={!search ? "New Chat" : undefined}
                    onAction={!search ? handleCreateChat : undefined}
                />
            ) : (
                <div className="space-y-2">
                    {filteredChats.map((chat, i) => (
                        <button
                            key={chat.id}
                            onClick={() =>
                                router.push(
                                    `/workspaces/${workspaceId}/chat/${chat.id}`
                                )
                            }
                            className={cn(
                                "w-full glass-card rounded-xl px-4 py-3.5 flex items-center gap-3 card-hover text-left group animate-slideUp opacity-0",
                                `animate-delay-${Math.min((i + 1) * 100, 500)}`
                            )}
                        >
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <MessageSquare className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                                    {chat.name}
                                </h4>
                                <div className="flex items-center gap-1 text-[10px] text-zinc-600 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {formatRelativeTime(chat.createdAt)}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
