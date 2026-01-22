"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import api, { setAuthToken } from "@/lib/api";
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

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Set auth token
    useEffect(() => {
        if (status === 'authenticated' && session?.accessToken) {
            setAuthToken(session.accessToken as string);
        } else {
            setAuthToken(null);
        }
    }, [session, status]);

    // Fetch chats on load
    useEffect(() => {
        if (status === 'authenticated' && session?.accessToken) {
            fetchChats();
        }
    }, [session, status]);

    const fetchChats = async () => {
        try {
            const response = await api.get('/api/v1/chat/');
            const chatsData: any[] = response.data;
            const formattedChats: Chat[] = chatsData.map(chat => ({
                id: chat.id,
                title: chat.name,
                messages: [], // Will load messages when selected
                createdAt: new Date(chat.createdAt).getTime(),
            }));
            setChats(formattedChats);
            if (formattedChats.length > 0 && !activeChatId) {
                setActiveChatId(formattedChats[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    };

    const fetchMessages = async (chatId: string) => {
        try {
            const response = await api.get(`/api/v1/chat/${chatId}/messages`);
            const messagesData: any[] = response.data;
            const formattedMessages: Message[] = messagesData.map(msg => ({
                id: msg.id,
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.message,
                createdAt: new Date(msg.createdAt).getTime(),
            }));
            setChats(prev => prev.map(chat =>
                chat.id === chatId ? { ...chat, messages: formattedMessages } : chat
            ));
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    // Derived state
    const activeChat = chats.find((c) => c.id === activeChatId);

    const createChat = async () => {
        try {
            const response = await api.post('/api/v1/chat/create', {
                source: 'standalone',
            });
            const { chatId, name } = response.data;
            const newChat: Chat = {
                id: chatId,
                title: name,
                messages: [],
                createdAt: Date.now(),
            };
            setChats((prev) => [newChat, ...prev]);
            setActiveChatId(newChat.id);
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    const selectChat = (chatId: string) => {
        setActiveChatId(chatId);
        const chat = chats.find(c => c.id === chatId);
        if (chat && chat.messages.length === 0) {
            fetchMessages(chatId);
        }
    };

    const sendMessage = async (content: string) => {
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

        try {
            const response = await api.post('/api/v1/chat/message', {
                chatId: activeChatId,
                message: content,
            });
            const { message: assistantMessage, name } = response.data;

            const botMessage: Message = {
                id: assistantMessage.id,
                role: "assistant",
                content: assistantMessage.message,
                createdAt: new Date(assistantMessage.createdAt).getTime(),
            };

            setChats((prev) =>
                prev.map((chat) => {
                    if (chat.id === activeChatId) {
                        return {
                            ...chat,
                            messages: [...chat.messages, botMessage],
                            title: name || chat.title, // Update title if changed
                        };
                    }
                    return chat;
                })
            );
        } catch (error) {
            console.error('Failed to send message:', error);
            // Optionally, remove the user message or show error
        } finally {
            setIsLoading(false);
        }
    };

    const deleteChat = async (chatId: string) => {
        try {
            await api.delete(`/api/v1/chat/${chatId}`);
            setChats((prev) => {
                const newChats = prev.filter((chat) => chat.id !== chatId);
                if (activeChatId === chatId) {
                    setActiveChatId(newChats.length > 0 ? newChats[0].id : null);
                }
                return newChats;
            });
        } catch (error) {
            console.error('Failed to delete chat:', error);
        }
    };

    const renameChat = async (chatId: string, newTitle: string) => {
        try {
            await api.put(`/api/v1/chat/${chatId}/rename`, {
                name: newTitle,
            });
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === chatId ? { ...chat, title: newTitle } : chat
                )
            );
        } catch (error) {
            console.error('Failed to rename chat:', error);
        }
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
