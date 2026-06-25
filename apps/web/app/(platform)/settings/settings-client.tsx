"use client";

import {
    User,
    Palette,
    Sparkles,
    Bell,
    Shield,
    Lock,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ThemeToggle } from "@/components/chatbot/ThemeToggle";

interface SettingsClientProps {
    userName: string;
    userEmail: string;
}

function SettingsSection({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: typeof User;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-zinc-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
                    {description && (
                        <p className="text-xs text-zinc-500">{description}</p>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

function ComingSoonBadge() {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-[10px] font-medium text-indigo-400">
            <Sparkles className="w-3 h-3" />
            Coming Soon
        </span>
    );
}

export function SettingsClient({ userName, userEmail }: SettingsClientProps) {
    return (
        <div className="space-y-6 max-w-2xl">
            <PageHeader
                title="Settings"
                description="Manage your account preferences and platform settings."
            />

            {/* Profile Section */}
            <div className="animate-slideUp opacity-0 animate-delay-100">
                <SettingsSection icon={User} title="Profile" description="Your account information">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-200">{userName}</p>
                            <p className="text-xs text-zinc-500">{userEmail}</p>
                        </div>
                    </div>
                </SettingsSection>
            </div>

            {/* Appearance Section */}
            <div className="animate-slideUp opacity-0 animate-delay-200">
                <SettingsSection icon={Palette} title="Appearance" description="Customize the look and feel">
                    <ThemeToggle />
                </SettingsSection>
            </div>

            {/* AI Settings */}
            <div className="animate-slideUp opacity-0 animate-delay-300">
                <SettingsSection icon={Sparkles} title="AI Settings" description="Configure AI behavior and preferences">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-sm text-zinc-400">
                                Model preferences, temperature, and token limits
                            </p>
                        </div>
                        <ComingSoonBadge />
                    </div>
                </SettingsSection>
            </div>

            {/* Notifications */}
            <div className="animate-slideUp opacity-0 animate-delay-400">
                <SettingsSection icon={Bell} title="Notifications" description="Manage your notification preferences">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="text-sm text-zinc-400">
                                Email and push notification settings
                            </p>
                        </div>
                        <ComingSoonBadge />
                    </div>
                </SettingsSection>
            </div>

            {/* Security */}
            <div className="animate-slideUp opacity-0 animate-delay-500">
                <SettingsSection icon={Shield} title="Security" description="Manage your security settings">
                    <div className="space-y-3 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-400">Two-factor authentication</span>
                            </div>
                            <ComingSoonBadge />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-400">API key management</span>
                            </div>
                            <ComingSoonBadge />
                        </div>
                    </div>
                </SettingsSection>
            </div>
        </div>
    );
}
