"use client";

import { cn } from "@/lib/utils";
import {
    Search,
    Boxes,
    MessageSquare,
    FileText,
    Plus,
    ArrowRight,
    Zap,
    Upload,
    Hash,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResult } from "@/actions/search";

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const quickActions = [
    { id: "new-workspace", label: "Create Workspace", icon: Plus, href: "/workspaces" },
    { id: "new-chat", label: "New Chat", icon: MessageSquare, href: "/chatbot" },
    { id: "upload-doc", label: "Upload Document", icon: Upload, href: "/workspaces" },
];

const typeIcons: Record<string, typeof Search> = {
    workspace: Boxes,
    chat: MessageSquare,
    document: FileText,
    agent: Zap,
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Focus input on open
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery("");
            setResults([]);
            setSelectedIndex(0);
        }
    }, [open]);

    // Cmd+K global shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                onOpenChange(!open);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onOpenChange]);

    // Search
    const performSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const data = await globalSearch(q);
            setResults(data.results || []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleQueryChange = (value: string) => {
        setQuery(value);
        setSelectedIndex(0);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(value), 300);
    };

    // All selectable items
    const allItems = query.trim()
        ? results
        : quickActions.map((a) => ({ ...a, type: "action" as const }));

    const totalItems = allItems.length;

    // Keyboard nav
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => (i + 1) % Math.max(totalItems, 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => (i - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            handleSelect(selectedIndex);
        }
    };

    const handleSelect = (index: number) => {
        const item = allItems[index];
        if (!item) return;

        if ("href" in item) {
            router.push(item.href);
        } else if ("url" in item) {
            router.push((item as SearchResult).url);
        }
        onOpenChange(false);
    };

    // Group results by type
    const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
        const group = r.type.charAt(0).toUpperCase() + r.type.slice(1) + "s";
        if (!acc[group]) acc[group] = [];
        acc[group].push(r);
        return acc;
    }, {});

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="sm:max-w-[540px] p-0 bg-zinc-900/95 backdrop-blur-2xl border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden gap-0"
            >
                <DialogTitle className="sr-only">Command Palette</DialogTitle>
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                    <Search className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search workspaces, chats, docs, or type a command..."
                        className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
                    />
                    <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-zinc-500 font-mono">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[360px] overflow-y-auto custom-scrollbar-thin py-2">
                    {loading && (
                        <div className="px-4 py-8 text-center">
                            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                            <p className="text-xs text-zinc-500 mt-3">Searching...</p>
                        </div>
                    )}

                    {!loading && !query.trim() && (
                        <>
                            <div className="px-4 py-1">
                                <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                                    Quick Actions
                                </p>
                            </div>
                            {quickActions.map((action, i) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleSelect(i)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                        selectedIndex === i
                                            ? "bg-white/[0.06] text-white"
                                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                                    )}
                                >
                                    <action.icon className="w-4 h-4 text-indigo-400" />
                                    <span>{action.label}</span>
                                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-zinc-600" />
                                </button>
                            ))}
                        </>
                    )}

                    {!loading && query.trim() && results.length === 0 && (
                        <div className="px-4 py-10 text-center">
                            <Hash className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm text-zinc-500">No results found</p>
                            <p className="text-xs text-zinc-600 mt-1">
                                Try a different search term
                            </p>
                        </div>
                    )}

                    {!loading &&
                        query.trim() &&
                        Object.entries(groupedResults).map(([group, items]) => (
                            <div key={group}>
                                <div className="px-4 py-1 mt-2">
                                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                                        {group}
                                    </p>
                                </div>
                                {items.map((item) => {
                                    const globalIdx = results.indexOf(item);
                                    const TypeIcon = typeIcons[item.type] || Hash;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => handleSelect(globalIdx)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                                selectedIndex === globalIdx
                                                    ? "bg-white/[0.06] text-white"
                                                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                                            )}
                                        >
                                            <TypeIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                                            <div className="flex-1 text-left min-w-0">
                                                <p className="truncate">{item.title}</p>
                                                {item.description && (
                                                    <p className="text-xs text-zinc-600 truncate">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            {item.workspaceName && (
                                                <span className="text-[10px] text-zinc-600 shrink-0">
                                                    {item.workspaceName}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-white/[0.06] flex items-center gap-4 text-[10px] text-zinc-600">
                    <span className="flex items-center gap-1">
                        <kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono">↑↓</kbd>
                        Navigate
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono">↵</kbd>
                        Select
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1 py-0.5 rounded bg-white/[0.06] font-mono">ESC</kbd>
                        Close
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
