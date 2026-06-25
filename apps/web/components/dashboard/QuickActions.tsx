"use client";

import { cn } from "@/lib/utils";
import { Plus, Boxes, MessageSquare, Upload, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuickAction {
    label: string;
    icon: typeof Boxes;
    secondaryIcon: typeof Plus;
    href: string;
    gradient: string;
}

const actions: QuickAction[] = [
    {
        label: "New Workspace",
        icon: Boxes,
        secondaryIcon: Plus,
        href: "/workspaces",
        gradient: "from-indigo-600/20 to-purple-600/20",
    },
    {
        label: "New Chat",
        icon: MessageSquare,
        secondaryIcon: Plus,
        href: "/chatbot",
        gradient: "from-blue-600/20 to-cyan-600/20",
    },
    {
        label: "Upload Document",
        icon: FileText,
        secondaryIcon: Upload,
        href: "/workspaces",
        gradient: "from-emerald-600/20 to-teal-600/20",
    },
];

interface QuickActionsProps {
    className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
    const router = useRouter();

    return (
        <div className={className}>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">
                Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => router.push(action.href)}
                        className={cn(
                            "glass-card rounded-xl p-4 flex items-center gap-3 card-hover group text-left"
                        )}
                    >
                        <div
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                                action.gradient
                            )}
                        >
                            <action.icon className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
