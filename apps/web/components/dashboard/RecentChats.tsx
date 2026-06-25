"use client";

import { cn } from "@/lib/utils";
import { MessageSquare, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChatListItem } from "@/actions/chat";

interface RecentChat extends ChatListItem {
    workspaceName?: string;
    workspaceId?: string;
    lastMessage?: string;
}

interface RecentChatsProps {
    chats: RecentChat[];
    className?: string;
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

export function RecentChats({ chats, className }: RecentChatsProps) {
    const router = useRouter();

    return (
        <div className={className}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">
                Recent Chats
            </h2>

            {chats.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center">
                    <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">No recent chats</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {chats.map((chat, i) => (
                        <div
                            key={chat.id}
                            onClick={() => {
                                if (chat.workspaceId) {
                                    router.push(`/workspaces/${chat.workspaceId}/chat/${chat.id}`);
                                } else {
                                    router.push(`/chatbot`);
                                }
                            }}
                            className={cn(
                                "glass-card rounded-xl px-4 py-3 cursor-pointer card-hover group animate-slideUp opacity-0",
                                `animate-delay-${(i + 1) * 100}`
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                                            {chat.name}
                                        </h4>
                                        {chat.workspaceName && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500 shrink-0">
                                                {chat.workspaceName}
                                            </span>
                                        )}
                                    </div>
                                    {chat.lastMessage && (
                                        <p className="text-xs text-zinc-500 mt-0.5 truncate">
                                            {chat.lastMessage}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-600 mt-1.5">
                                        <Clock className="w-3 h-3" />
                                        {formatRelativeTime(chat.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
