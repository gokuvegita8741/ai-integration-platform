"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageVersionSelectorProps {
    currentVersion: number;
    totalVersions: number;
    onVersionChange: (version: number) => void;
    isLoading?: boolean;
}

export function MessageVersionSelector({
    currentVersion,
    totalVersions,
    onVersionChange,
    isLoading = false,
}: MessageVersionSelectorProps) {
    if (totalVersions <= 1) return null;

    const handlePrevious = () => {
        if (currentVersion > 1 && !isLoading) {
            onVersionChange(currentVersion - 1);
        }
    };

    const handleNext = () => {
        if (currentVersion < totalVersions && !isLoading) {
            onVersionChange(currentVersion + 1);
        }
    };

    return (
        <div className="flex items-center gap-1 mt-2">
            <button
                onClick={handlePrevious}
                disabled={currentVersion <= 1 || isLoading}
                className={cn(
                    "p-1 rounded-full transition-colors",
                    "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "disabled:opacity-30 disabled:cursor-not-allowed"
                )}
                aria-label="Previous version"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium min-w-[40px] text-center">
                {currentVersion}/{totalVersions}
            </span>

            <button
                onClick={handleNext}
                disabled={currentVersion >= totalVersions || isLoading}
                className={cn(
                    "p-1 rounded-full transition-colors",
                    "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "disabled:opacity-30 disabled:cursor-not-allowed"
                )}
                aria-label="Next version"
            >
                <ChevronRight className="w-4 h-4" />
            </button>

            {/* Version dots for visual indication */}
            <div className="flex gap-1 ml-2">
                {Array.from({ length: totalVersions }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => !isLoading && onVersionChange(i + 1)}
                        disabled={isLoading}
                        className={cn(
                            "w-1.5 h-1.5 rounded-full transition-colors",
                            i + 1 === currentVersion
                                ? "bg-indigo-500"
                                : "bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500",
                            isLoading && "cursor-not-allowed"
                        )}
                        aria-label={`Go to version ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
