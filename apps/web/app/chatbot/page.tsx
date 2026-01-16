"use client" // Must be client to hold state

import { useState, useEffect } from "react"; // Add React hooks
import { useSession } from "next-auth/react"; // Session hooks if needed directly, but usually handled by layout/middleware
import { redirect } from "next/navigation";
import { ChatSidebar } from "@/components/chatbot/ChatSidebar";
import { ChatMain } from "@/components/chatbot/ChatMain";
import { ChatProvider } from "@/components/chatbot/ChatContext";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


export default function ChatbotPage() {
    // Note: We can't use `getServerSession` directly in a "use client" component.
    // Authentication is ideally protected by middleware or a server wrapper.
    // For now, assuming the wrapper or middleware handles the redirect if not auth.

    // State for sidebar visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Responsive check to auto-close/open sidebar could be added here

    return (
        <ChatProvider>
            <div className="flex h-screen overflow-hidden bg-white dark:bg-black">

                {/* Desktop Sidebar */}
                <div
                    className={`
                hidden md:block 
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'w-[280px]' : 'w-0 opacity-0 overflow-hidden'}
            `}
                >
                    <ChatSidebar />
                </div>

                {/* Mobile Sidebar (Sheet) */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 w-[280px] border-r-zinc-800 bg-black">
                        <VisuallyHidden>
                            <SheetTitle>Navigation Menu</SheetTitle>
                        </VisuallyHidden>
                        <ChatSidebar onSelect={() => setIsMobileMenuOpen(false)} />
                    </SheetContent>
                </Sheet>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <ChatMain
                        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                        isSidebarOpen={isSidebarOpen}
                        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
                    />
                </div>
            </div>
        </ChatProvider>
    );
}
