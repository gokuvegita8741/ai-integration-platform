"use client";

import { Check, Diamond, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PricingPage() {
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
                    <span className="font-bold text-lg tracking-tight">QuickGPT <span className="text-zinc-400 font-normal">Pricing</span></span>
                </div>
                <div className="w-[100px]" /> {/* Spacer for centering */}
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400">
                        Choose the plan that's right for you. Upgrade anytime to unlock the full potential of QuickGPT.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                    {/* Free Plan */}
                    <div className="relative rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-xl font-medium mb-2">Free</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">$0</span>
                                <span className="text-zinc-500">/month</span>
                            </div>
                            <p className="text-sm text-zinc-500 mt-2">Perfect for getting started</p>
                        </div>

                        <div className="space-y-4 flex-1 mb-8">
                            {[
                                "Access to GPT-3.5 model",
                                "Basic response speed",
                                "Standard support",
                                "Limited chat history"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" className="w-full h-12 rounded-xl border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800" asChild>
                            <Link href="/chatbot">Current Plan</Link>
                        </Button>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative rounded-3xl p-8 border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-[#121016] flex flex-col shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-900/10">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                                <Zap className="w-3 h-3" />
                                Most Popular
                            </span>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-medium mb-2 text-indigo-600 dark:text-indigo-400">Pro</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">$20</span>
                                <span className="text-zinc-500">/month</span>
                            </div>
                            <p className="text-sm text-zinc-500 mt-2">For power users who need the best</p>
                        </div>

                        <div className="space-y-4 flex-1 mb-8">
                            {[
                                "Access to GPT-4 model",
                                "Fast response speed",
                                "Priority support",
                                "Unlimited chat history",
                                "Early access to new features"
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25">
                            Upgrade to Pro
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
