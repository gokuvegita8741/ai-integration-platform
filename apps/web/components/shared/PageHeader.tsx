"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Breadcrumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("animate-fadeIn", className)}>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-sm text-zinc-500 mb-3">
                    {breadcrumbs.map((crumb, i) => (
                        <div key={i} className="flex items-center gap-1">
                            {i > 0 && (
                                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                            )}
                            {crumb.href ? (
                                <Link
                                    href={crumb.href}
                                    className="hover:text-zinc-300 transition-colors"
                                >
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-zinc-400">{crumb.label}</span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            {/* Title + Actions Row */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-1 text-sm text-zinc-400">
                            {description}
                        </p>
                    )}
                </div>

                {actions && (
                    <div className="flex items-center gap-2 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
