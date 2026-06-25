"use client";

import { Plus, Search, Sparkles, Diamond, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChatActions } from "./ChatActions";
import { UserNav } from "./UserNav";
import { ChatListItem } from "@/actions/chat";
import { useState } from "react";
import {useRouter} from 'next/navigation';

interface ChatSidebarProps {
    className?: string;
    chats: ChatListItem[];
    activeChatId?: string | null;
    onCreateChat: () => Promise<void>;
    onSelectChat: (chatId: string) => void;
    onRenameChat: (chatId: string, newName: string) => Promise<void>;
    onDeleteChat: (chatId: string) => Promise<void>;
    isPending?: boolean;
}

export function ChatSidebar({
    className,
    chats,
    activeChatId,
    onCreateChat,
    onSelectChat,
    onRenameChat,
    onDeleteChat,
    isPending,
}: ChatSidebarProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleCreateNew = async () => {
        setIsCreating(true);
        try {
            await onCreateChat();
        } finally {
            setIsCreating(false);
        }
    };

    // Filter chats by search query
    const filteredChats = chats.filter((chat) =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className={cn(
                "h-full flex flex-col bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800",
                className
            )}
        >
            {/* Header */}
            <div className="px-3 py-2 mt-1">
                <div onClick={() => router.push('/dashboard')} className="flex cursor-pointer items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="font-bold text-md leading-tight text-zinc-900 dark:text-white">
                            QuickGPT
                        </h1>
                        <p className="text-xs text-zinc-500">Intelligent AI Assistant</p>
                    </div>
                </div>
                {/* Search */}
                <div className="mb-2">
                    <div className="relative text-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Search conversations"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-transparent border-2 border-zinc-200 dark:border-zinc-800 placeholder:text-xs dark:placeholder:text-zinc-400 dark:text-white focus-visible:ring-indigo-500 transition-all rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Recent Chats */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-3 py-2 uppercase tracking-wider">
                        Recent Chats ({filteredChats.length})
                    </h3>
                    <button
                        onClick={handleCreateNew}
                        disabled={isCreating}
                        className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {isCreating ? (
                            <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4 text-zinc-400 cursor-pointer" />
                        )}
                    </button>
                </div>

                {filteredChats.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-sm">
                        {searchQuery ? "No chats found" : "No chats yet. Click + to start!"}
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={cn(
                                "group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all border",
                                activeChatId === chat.id
                                    ? "border-zinc-200 dark:border-zinc-800 dark:bg-linear-to-r dark:from-[#151019] dark:via-[#15101B] dark:to-[#141017]"
                                    : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                            )}
                        >
                            <div className="min-w-0 flex-1 mr-2">
                                <h4
                                    className={cn(
                                        "font-medium text-sm mb-0.5 truncate",
                                        activeChatId === chat.id
                                            ? "text-zinc-900 dark:text-zinc-100"
                                            : "text-zinc-600 dark:text-zinc-400"
                                    )}
                                >
                                    {chat.name}
                                </h4>
                                <p className="text-[10px] text-zinc-400">
                                    {new Date(chat.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            {/* Chat Actions Dropdown */}
                            <div
                                className={cn(
                                    activeChatId === chat.id
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100",
                                    "transition-opacity"
                                )}
                            >
                                <ChatActions
                                    chat={chat}
                                    onRename={onRenameChat}
                                    onDelete={onDeleteChat}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-4 space-y-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black/50">
                {/* Credits Card */}
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900/50">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Diamond className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            2 Credits
                        </p>
                        <p className="text-xs text-zinc-500">Free tier plan</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                        asChild
                    >
                        <Link href="/pricing">Buy</Link>
                    </Button>
                </div>

                <UserNav />
            </div>
        </div>
    );
}
