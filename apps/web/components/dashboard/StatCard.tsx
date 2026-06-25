"use client";

import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    trend?: { value: number; positive: boolean };
    accentColor?: string;
    className?: string;
}

export function StatCard({
    icon: Icon,
    label,
    value,
    trend,
    accentColor = "#6366f1",
    className,
}: StatCardProps) {
    return (
        <div
            className={cn(
                "glass-card rounded-2xl p-5 card-hover group relative overflow-hidden",
                className
            )}
        >
            {/* Background gradient glow */}
            <div
                className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${accentColor}, transparent 60%)`,
                }}
            />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${accentColor}15` }}
                    >
                        <Icon className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    {trend && (
                        <div
                            className={cn(
                                "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                                trend.positive
                                    ? "text-emerald-400 bg-emerald-500/10"
                                    : "text-red-400 bg-red-500/10"
                            )}
                        >
                            {trend.positive ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            {trend.value}%
                        </div>
                    )}
                </div>

                <p className="text-2xl font-bold text-zinc-100 mb-1">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
            </div>
        </div>
    );
}
