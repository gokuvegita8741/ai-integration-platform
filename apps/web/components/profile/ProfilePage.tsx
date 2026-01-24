"use client";

import { User as UserIcon, Mail, Shield, ArrowLeft, Diamond } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

interface User {
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

interface ProfilePageProps {
    user: User;
}

export function ProfilePage({ user }: ProfilePageProps) {
    const userInitials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U';

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
            {/* Header / Nav */}
            <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
                <Link href="/chatbot" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Chat</span>
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Diamond className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">QuickGPT <span className="text-zinc-400 font-normal">Profile</span></span>
                </div>
                <div className="w-[100px]" /> {/* Spacer */}
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-[#121016] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
                        <div className="flex flex-col items-center mb-8">
                            <Avatar className="h-24 w-24 border-4 border-white dark:border-[#121016] shadow-lg mb-4">
                                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                                <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-2xl font-medium">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-zinc-500 dark:text-zinc-400">{user.email}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Current Plan</p>
                                    <p className="text-xs text-zinc-500">Pro Subscription</p>
                                </div>
                                <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                                    <Link href="/pricing">Manage</Link>
                                </Button>
                            </div>

                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Email Support</p>
                                    <p className="text-xs text-zinc-500">help@quickgpt.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-center">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
