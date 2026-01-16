"use client"

import { Send, Sparkles, ChevronDown, User, Bot, Loader2, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChat } from "./ChatContext"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" - Removed sheet import as we control visibility by parent or button
// Actually we need sheet for mobile.

interface ChatMainProps {
    toggleSidebar: () => void
    isSidebarOpen: boolean
    onMobileMenuOpen: () => void
}

export function ChatMain({ toggleSidebar, isSidebarOpen, onMobileMenuOpen }: ChatMainProps) {
    const { activeChat, sendMessage, isLoading } = useChat()
    const [inputValue, setInputValue] = useState("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [activeChat?.messages, isLoading])

    const handleSend = () => {
        if (!inputValue.trim()) return
        sendMessage(inputValue)
        setInputValue("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const hasMessages = activeChat && activeChat.messages.length > 0

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
                        isSidebarOpen ? "" : "rotate-180" // Optional rotation effect or use different icons
                    )}
                    onClick={toggleSidebar}
                >
                    {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
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
            <div className={cn(
                "flex-1 w-full max-w-3xl mx-auto overflow-y-auto pt-16 pb-32 px-4 scrollbar-hide",
                !hasMessages ? "flex items-center justify-center" : ""
            )}>
                {!hasMessages ? (
                    // Welcome Screen (Empty State)
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
                        {activeChat.messages.map((msg) => (
                            <div key={msg.id} className={cn("flex gap-4 w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                )}

                                <div className={cn(
                                    "max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-sm"
                                        : "bg-white dark:bg-[#121214] border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                                )}>
                                    {msg.content}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 mt-1">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
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
                            className="
                    flex-1 h-11 bg-transparent outline-none border-0
                    text-sm text-zinc-900 dark:text-white
                    placeholder:text-zinc-400
                    min-w-0
                "
                        />

                        {/* Send button */}
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
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
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
