import { Metadata } from "next";
import {
    Database,
    Layers,
    Cpu,
    SlidersHorizontal,
    Search,
    Link2,
    BarChart3,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Knowledge Base — AI Workspace",
    description: "Manage your workspace knowledge base with advanced RAG capabilities.",
};

const features = [
    {
        icon: Layers,
        title: "Chunk Management",
        description: "Break documents into searchable chunks with configurable size and overlap strategies.",
        gradient: "from-blue-600/20 to-indigo-600/20",
        iconColor: "#6366f1",
    },
    {
        icon: Cpu,
        title: "Embedding Management",
        description: "Generate vector embeddings for semantic search using state-of-the-art models.",
        gradient: "from-purple-600/20 to-pink-600/20",
        iconColor: "#a855f7",
    },
    {
        icon: SlidersHorizontal,
        title: "Retrieval Settings",
        description: "Fine-tune RAG retrieval parameters including top-k, similarity thresholds, and re-ranking.",
        gradient: "from-emerald-600/20 to-teal-600/20",
        iconColor: "#22c55e",
    },
    {
        icon: Search,
        title: "Search Configuration",
        description: "Configure search algorithms, hybrid search weights, and result ranking strategies.",
        gradient: "from-cyan-600/20 to-blue-600/20",
        iconColor: "#06b6d4",
    },
    {
        icon: Link2,
        title: "Source Management",
        description: "Manage knowledge sources, track document lineage, and configure data connections.",
        gradient: "from-orange-600/20 to-amber-600/20",
        iconColor: "#f97316",
    },
    {
        icon: BarChart3,
        title: "Knowledge Analytics",
        description: "Monitor knowledge base performance, query patterns, and retrieval quality metrics.",
        gradient: "from-rose-600/20 to-pink-600/20",
        iconColor: "#f43f5e",
    },
];

export default function KnowledgeBasePage() {
    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8 animate-fadeIn">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-5 animate-float">
                    <Database className="w-8 h-8 text-indigo-400" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">
                    <span className="gradient-text">Knowledge Base</span>
                </h1>
                <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
                    Transform your documents into an intelligent knowledge base with
                    advanced RAG capabilities. Search, retrieve, and reason over your data.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/10 text-xs font-medium text-indigo-400">
                        <Sparkles className="w-3 h-3" />
                        Coming Soon
                    </span>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, i) => (
                    <div
                        key={feature.title}
                        className={cn(
                            "glass-card rounded-2xl p-5 relative overflow-hidden group animate-slideUp opacity-0",
                            `animate-delay-${Math.min((i + 1) * 100, 500)}`
                        )}
                    >
                        {/* Background gradient */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{
                                background: `radial-gradient(300px circle at 50% 50%, ${feature.iconColor}08, transparent 70%)`,
                            }}
                        />

                        <div className="relative z-10">
                            <div
                                className={cn(
                                    "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br mb-4",
                                    feature.gradient
                                )}
                            >
                                <feature.icon className="w-5.5 h-5.5" style={{ color: feature.iconColor }} />
                            </div>

                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-sm font-semibold text-zinc-200">
                                    {feature.title}
                                </h3>
                                <span className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[9px] text-zinc-500 font-medium shrink-0">
                                    SOON
                                </span>
                            </div>

                            <p className="text-xs text-zinc-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom CTA */}
            <div className="glass-card rounded-2xl p-6 text-center animate-slideUp opacity-0 animate-delay-500">
                <p className="text-sm text-zinc-400">
                    Knowledge Base features are currently in development. Stay tuned for powerful RAG capabilities.
                </p>
                <div className="flex items-center justify-center gap-4 mt-3">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-700" />
                    <Sparkles className="w-4 h-4 text-zinc-600" />
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-700" />
                </div>
            </div>
        </div>
    );
}
