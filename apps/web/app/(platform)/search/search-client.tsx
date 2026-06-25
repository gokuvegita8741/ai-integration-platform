"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
    Search,
    Boxes,
    MessageSquare,
    FileText,
    Bot,
    Hash,
    Sparkles,
} from "lucide-react";
import { SearchInput } from "@/components/shared/SearchInput";
import { globalSearch, type SearchResult, type SearchResponse } from "@/actions/search";
import { useRouter } from "next/navigation";

const typeIcons: Record<string, typeof Search> = {
    workspace: Boxes,
    chat: MessageSquare,
    document: FileText,
    agent: Bot,
};

const typeColors: Record<string, string> = {
    workspace: "text-indigo-400 bg-indigo-500/10",
    chat: "text-blue-400 bg-blue-500/10",
    document: "text-emerald-400 bg-emerald-500/10",
    agent: "text-purple-400 bg-purple-500/10",
};

export function SearchPageClient() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = useCallback(async (q: string) => {
        setQuery(q);
        if (!q.trim()) {
            setResults([]);
            setTotal(0);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);
        try {
            const data = await globalSearch(q);
            setResults(data.results || []);
            setTotal(data.total || 0);
        } catch {
            setResults([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Group results by type
    const groupedResults = results.reduce<Record<string, SearchResult[]>>(
        (acc, r) => {
            const group = r.type.charAt(0).toUpperCase() + r.type.slice(1) + "s";
            if (!acc[group]) acc[group] = [];
            acc[group].push(r);
            return acc;
        },
        {}
    );

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center animate-fadeIn pt-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
                    Search
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Find anything across your workspaces
                </p>
            </div>

            {/* Search Input */}
            <div className="animate-slideUp opacity-0 animate-delay-100">
                <SearchInput
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search workspaces, chats, documents, agents..."
                    loading={loading}
                    autoFocus
                    className="max-w-xl mx-auto"
                />
            </div>

            {/* Results */}
            <div className="animate-slideUp opacity-0 animate-delay-200">
                {/* Loading */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-zinc-500 mt-3">Searching...</p>
                    </div>
                )}

                {/* No query yet */}
                {!loading && !hasSearched && (
                    <div className="text-center py-12">
                        <Sparkles className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500">
                            Search across your workspaces
                        </p>
                        <p className="text-xs text-zinc-600 mt-1">
                            Find chats, documents, agents, and more
                        </p>
                    </div>
                )}

                {/* No results */}
                {!loading && hasSearched && results.length === 0 && (
                    <div className="text-center py-12">
                        <Hash className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                        <p className="text-sm text-zinc-500">No results found</p>
                        <p className="text-xs text-zinc-600 mt-1">
                            Try a different search term
                        </p>
                    </div>
                )}

                {/* Grouped Results */}
                {!loading &&
                    Object.entries(groupedResults).map(([group, items]) => (
                        <div key={group} className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                                    {group}
                                </h3>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-600">
                                    {items.length}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {items.map((item) => {
                                    const Icon = typeIcons[item.type] || Hash;
                                    const colorClass = typeColors[item.type] || "text-zinc-400 bg-zinc-500/10";
                                    const [textColor, bgColor] = colorClass.split(" ");

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => router.push(item.url)}
                                            className="w-full glass-card rounded-xl px-4 py-3 flex items-center gap-3 card-hover text-left group"
                                        >
                                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", bgColor)}>
                                                <Icon className={cn("w-4.5 h-4.5", textColor)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">
                                                    {item.title}
                                                </p>
                                                {item.description && (
                                                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            {item.workspaceName && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-500 shrink-0">
                                                    {item.workspaceName}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                {/* Total count */}
                {!loading && hasSearched && results.length > 0 && (
                    <p className="text-center text-xs text-zinc-600 pt-4">
                        {total} result{total !== 1 ? "s" : ""} found
                    </p>
                )}
            </div>
        </div>
    );
}
