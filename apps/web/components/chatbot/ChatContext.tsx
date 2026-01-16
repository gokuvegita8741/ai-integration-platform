"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

// --- Types ---
export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: number;
};

export type Chat = {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
};

type ChatContextType = {
    chats: Chat[];
    activeChatId: string | null;
    activeChat: Chat | undefined;
    isLoading: boolean;
    createChat: () => void;
    selectChat: (chatId: string) => void;
    sendMessage: (content: string) => void;
    deleteChat: (chatId: string) => void;
    renameChat: (chatId: string, newTitle: string) => void;
};

// --- Initial Mock Data ---
const INITIAL_CHAT_ID = uuidv4();
const INITIAL_CHATS: Chat[] = [
    {
        id: INITIAL_CHAT_ID,
        title: "New Chat",
        messages: [],
        createdAt: Date.now(),
    },
];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
    const [activeChatId, setActiveChatId] = useState<string | null>(INITIAL_CHAT_ID);
    const [isLoading, setIsLoading] = useState(false);

    // Derived state
    const activeChat = chats.find((c) => c.id === activeChatId);

    const createChat = () => {
        const newChat: Chat = {
            id: uuidv4(),
            title: "New Chat",
            messages: [],
            createdAt: Date.now(),
        };
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
    };

    const selectChat = (chatId: string) => {
        setActiveChatId(chatId);
    };

    const sendMessage = (content: string) => {
        if (!activeChatId) return;

        const userMessage: Message = {
            id: uuidv4(),
            role: "user",
            content,
            createdAt: Date.now(),
        };

        // Update state with user message immediately
        setChats((prev) =>
            prev.map((chat) => {
                if (chat.id === activeChatId) {
                    return {
                        ...chat,
                        messages: [...chat.messages, userMessage],
                        // Update title if it's the first message
                        title: chat.messages.length === 0 ? content.slice(0, 30) : chat.title,
                    };
                }
                return chat;
            })
        );

        setIsLoading(true);

        // Simulate Bot Response
        setTimeout(() => {
            const botMessage: Message = {
                id: uuidv4(),
                role: "assistant",
                content: `This is a mock response to: "${content}". I am a friendly AI assistant prototype!`,
                createdAt: Date.now(),
            };

            setChats((prev) =>
                prev.map((chat) => {
                    if (chat.id === activeChatId) {
                        return {
                            ...chat,
                            messages: [...chat.messages, botMessage],
                        };
                    }
                    return chat;
                })
            );
            setIsLoading(false);
        }, 1500); // 1.5s delay
    };

    const deleteChat = (chatId: string) => {
        setChats((prev) => {
            const newChats = prev.filter((chat) => chat.id !== chatId);
            return newChats;
        });

        if (activeChatId === chatId) {
            setActiveChatId(null);
        }
    };

    const renameChat = (chatId: string, newTitle: string) => {
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === chatId ? { ...chat, title: newTitle } : chat
            )
        );
    };

    const value = {
        chats,
        activeChatId,
        activeChat,
        isLoading,
        createChat,
        selectChat,
        sendMessage,
        deleteChat,
        renameChat,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}
