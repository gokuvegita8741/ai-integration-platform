"use client";

import {
    Send,
    Sparkles,
    ChevronDown,
    User,
    Bot,
    Loader2,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { getStreamConfig, getRegenerateConfig, switchMessageVersion, ChatMessageVersion } from "@/actions/chat";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { MessageVersionSelector } from "./MessageVersionSelector";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: number;
    sequence?: number;
    versions?: ChatMessageVersion[];
    activeVersionNumber?: number;
    totalVersions?: number;
}

interface ChatMainProps {
    chatId?: string | null;
    chatName?: string;
    initialMessages?: Message[];
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    onMobileMenuOpen: () => void;
    onChatNameUpdate?: (newName: string) => void;
}

export function ChatMain({
    chatId,
    chatName = "New Chat",
    initialMessages = [],
    toggleSidebar,
    isSidebarOpen,
    onMobileMenuOpen,
    onChatNameUpdate,
}: ChatMainProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
    const [regeneratingContent, setRegeneratingContent] = useState("");
    const [switchingVersionId, setSwitchingVersionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent, regeneratingContent, scrollToBottom]);

    // Reset messages when chat changes
    useEffect(() => {
        setMessages(initialMessages);
        setStreamingContent("");
        setRegeneratingMessageId(null);
        setRegeneratingContent("");
    }, [chatId, initialMessages]);

    const handleSend = async () => {
        if (!inputValue.trim() || !chatId || isLoading) return;

        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content: inputValue.trim(),
            createdAt: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);
        setStreamingContent("");

        try {
            const config = await getStreamConfig(chatId, userMessage.content);

            const response = await fetch(config.url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(config.body),
            });

            if (!response.ok) {
                throw new Error("Stream request failed");
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("No reader available");
            }

            const decoder = new TextDecoder();
            let fullContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === "name" && onChatNameUpdate) {
                                onChatNameUpdate(data.name);
                            } else if (data.type === "chunk") {
                                fullContent += data.content;
                                setStreamingContent(fullContent);
                            } else if (data.type === "done") {
                                const assistantMessage: Message = {
                                    id: data.messageId,
                                    role: "assistant",
                                    content: fullContent,
                                    createdAt: Date.now(),
                                    totalVersions: 1,
                                    activeVersionNumber: undefined,
                                };
                                setMessages((prev) => [...prev, assistantMessage]);
                                setStreamingContent("");
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Streaming error:", error);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: "Sorry, there was an error processing your request. Please try again.",
                createdAt: Date.now(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            setStreamingContent("");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = async (messageId: string) => {
        if (isLoading || regeneratingMessageId) return;

        setRegeneratingMessageId(messageId);
        setRegeneratingContent("");

        try {
            const config = await getRegenerateConfig(messageId);

            const response = await fetch(config.url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Regenerate request failed");
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("No reader available");
            }

            const decoder = new TextDecoder();
            let fullContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.type === "chunk") {
                                fullContent += data.content;
                                setRegeneratingContent(fullContent);
                            } else if (data.type === "done") {
                                const updatedMessage = data.message;
                                const truncatedCount = data.truncatedCount || 0;

                                // Update the message in state with new version info
                                setMessages((prev) => {
                                    let newMessages = prev.map((msg) => {
                                        if (msg.id === messageId) {
                                            return {
                                                ...msg,
                                                content: updatedMessage.content,
                                                versions: updatedMessage.versions,
                                                activeVersionNumber: updatedMessage.activeVersionNumber,
                                                totalVersions: updatedMessage.totalVersions,
                                            };
                                        }
                                        return msg;
                                    });

                                    // If messages were truncated, remove them from display
                                    if (truncatedCount > 0) {
                                        const targetIndex = newMessages.findIndex((m) => m.id === messageId);
                                        if (targetIndex !== -1) {
                                            newMessages = newMessages.slice(0, targetIndex + 1);
                                        }
                                    }

                                    return newMessages;
                                });

                                setRegeneratingContent("");
                                setRegeneratingMessageId(null);
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Regenerate error:", error);
            setRegeneratingContent("");
            setRegeneratingMessageId(null);
        }
    };

    const handleVersionSwitch = async (messageId: string, versionNumber: number) => {
        if (switchingVersionId) return;

        setSwitchingVersionId(messageId);

        try {
            const result = await switchMessageVersion(messageId, versionNumber);

            setMessages((prev) =>
                prev.map((msg) => {
                    if (msg.id === messageId) {
                        return {
                            ...msg,
                            content: result.message.content,
                            activeVersionNumber: result.message.activeVersionNumber,
                        };
                    }
                    return msg;
                })
            );
        } catch (error) {
            console.error("Version switch error:", error);
        } finally {
            setSwitchingVersionId(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const hasMessages = messages.length > 0 || streamingContent;
    const showNoChatSelected = !chatId;

    return (
        <div className="flex-1 h-screen flex flex-col bg-zinc-50 dark:bg-[#09090b] transition-colors duration-300 relative overflow-hidden">
            {/* Mobile Header / Desktop Toggle */}
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
                {/* Mobile Menu Trigger */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    onClick={onMobileMenuOpen}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Desktop Sidebar Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "hidden md:flex text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-transform duration-300",
                        isSidebarOpen ? "" : "rotate-180"
                    )}
                    onClick={toggleSidebar}
                >
                    {isSidebarOpen ? (
                        <PanelLeftClose className="w-5 h-5" />
                    ) : (
                        <PanelLeftOpen className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {/* Background Elements */}
            {!hasMessages && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]" />
                </div>
            )}

            {/* Chat Area */}
            <div
                className={cn(
                    "flex-1 w-full md:max-w-5xl mx-auto overflow-y-auto pt-16 pb-32 px-4 scrollbar-hide",
                    !hasMessages ? "flex items-center justify-center" : ""
                )}
            >
                {showNoChatSelected ? (
                    // No Chat Selected State
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-14 h-14 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 mb-8">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 mb-4">
                            QuickGPT
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                            Select a chat or create a new one to get started.
                        </p>
                    </div>
                ) : !hasMessages ? (
                    // Welcome Screen (Empty Chat)
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-14 h-14 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 mb-8">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div className="flex items-center justify-center mb-2">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                                QuickGPT
                            </h1>
                        </div>
                        <p className="text-zinc-500 text-sm dark:text-indigo-400 font-medium tracking-wide mb-6">
                            Intelligent AI Assistant
                        </p>
                        <h2 className="text-3xl md:text-5xl tracking-tight text-zinc-900 dark:text-white opacity-90">
                            Ask me anything.
                        </h2>
                    </div>
                ) : (
                    // Message List
                    <div className="space-y-6 w-full">
                        {messages.map((msg) => {
                            const isRegenerating = regeneratingMessageId === msg.id;
                            const isSwitchingVersion = switchingVersionId === msg.id;

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-4 w-full group",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                    )}

                                    <div className="flex flex-col max-w-[95%] sm:max-w-[75%]">
                                        <div
                                            className={cn(
                                                "rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-sm"
                                                    : "bg-white dark:bg-[#121214] text-zinc-800 dark:text-zinc-200"
                                            )}
                                        >
                                            {msg.role === "assistant" ? (
                                                isRegenerating ? (
                                                    <MarkdownRenderer content={regeneratingContent || "..."} />
                                                ) : (
                                                    <MarkdownRenderer content={msg.content} />
                                                )
                                            ) : (
                                                msg.content
                                            )}
                                        </div>

                                        {/* Regenerate button and Version selector for assistant messages */}
                                        {msg.role === "assistant" && !isRegenerating && (
                                            <div className="flex items-center gap-2 mt-1">
                                                {/* Regenerate button */}
                                                <button
                                                    onClick={() => handleRegenerate(msg.id)}
                                                    disabled={isLoading || regeneratingMessageId !== null}
                                                    className={cn(
                                                        "p-1.5 rounded-full transition-all",
                                                        "text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400",
                                                        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                                                        "opacity-0 group-hover:opacity-100",
                                                        "disabled:opacity-30 disabled:cursor-not-allowed"
                                                    )}
                                                    title="Regenerate response"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>

                                                {/* Version selector */}
                                                {msg.totalVersions && msg.totalVersions > 1 && msg.activeVersionNumber && (
                                                    <MessageVersionSelector
                                                        currentVersion={msg.activeVersionNumber}
                                                        totalVersions={msg.totalVersions}
                                                        onVersionChange={(v) => handleVersionSwitch(msg.id, v)}
                                                        isLoading={isSwitchingVersion}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Loading indicator during regeneration */}
                                        {isRegenerating && !regeneratingContent && (
                                            <div className="flex items-center gap-2 mt-2 text-zinc-400">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-xs">Regenerating...</span>
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === "user" && (
                                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 mt-1">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Streaming Message */}
                        {streamingContent && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="max-w-[95%] sm:max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm bg-white dark:bg-[#121214] text-zinc-800 dark:text-zinc-200">
                                    <MarkdownRenderer content={streamingContent} />
                                </div>
                            </div>
                        )}

                        {/* Loading Indicator */}
                        {isLoading && !streamingContent && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="flex items-center h-10">
                                    <span className="flex gap-1">
                                        <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area (Fixed Bottom) */}
            {chatId && (
                <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-20">
                    <div className="relative group">
                        {/* Gradient glow border */}
                        <div
                            className="
                                absolute -inset-px rounded-full
                                bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-600
                                opacity-25
                                group-hover:opacity-40
                                transition-opacity
                            "
                        />

                        {/* Main container */}
                        <div
                            className="
                                relative flex items-center gap-2
                                rounded-full px-2 py-2
                                bg-white/90 dark:bg-[#121214]/90
                                backdrop-blur-sm
                                shadow-lg
                            "
                        >
                            {/* Mode selector */}
                            <button
                                className="
                                    flex items-center gap-1
                                    rounded-full px-3 sm:px-4 h-10
                                    text-xs sm:text-sm font-medium
                                    text-zinc-600 hover:text-zinc-900
                                    dark:text-zinc-400 dark:hover:text-white
                                    transition
                                "
                            >
                                Text
                                <ChevronDown className="w-4 h-4 opacity-60" />
                            </button>

                            {/* Input */}
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your prompt here..."
                                disabled={isLoading || regeneratingMessageId !== null}
                                className="
                                    flex-1 h-11 bg-transparent outline-none border-0
                                    text-sm text-zinc-900 dark:text-white
                                    placeholder:text-zinc-400
                                    min-w-0
                                    disabled:opacity-50
                                "
                            />

                            {/* Send button */}
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading || regeneratingMessageId !== null}
                                className="
                                    flex items-center justify-center
                                    w-11 h-11 rounded-full
                                    bg-indigo-600 hover:bg-indigo-700
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    text-white
                                    transition
                                    shrink-0
                                "
                            >
                                {isLoading || regeneratingMessageId ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
