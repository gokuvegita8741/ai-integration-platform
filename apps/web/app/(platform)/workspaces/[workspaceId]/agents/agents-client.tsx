"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Bot,
    Plus,
    Compass,
    Code,
    PenTool,
    BarChart3,
    Puzzle,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { AgentCard } from "@/components/agents/AgentCard";
import { CreateAgentDialog } from "@/components/agents/CreateAgentDialog";
import { toggleAgent, deleteAgent, type Agent } from "@/actions/agent";
import { notifications } from "@mantine/notifications";

interface AgentsClientProps {
    workspaceId: string;
    initialAgents: Agent[];
}

const agentTypeSuggestions = [
    {
        type: "research" as const,
        name: "Research Agent",
        description: "Analyze documents, search the web, and synthesize information from multiple sources.",
        icon: Compass,
        color: "#06b6d4",
        gradient: "from-cyan-600/20 to-teal-600/20",
    },
    {
        type: "coding" as const,
        name: "Coding Agent",
        description: "Write, review, and debug code with deep understanding of your codebase.",
        icon: Code,
        color: "#22c55e",
        gradient: "from-green-600/20 to-emerald-600/20",
    },
    {
        type: "writing" as const,
        name: "Writing Agent",
        description: "Draft, edit, and refine content with context from your workspace documents.",
        icon: PenTool,
        color: "#f97316",
        gradient: "from-orange-600/20 to-amber-600/20",
    },
    {
        type: "data" as const,
        name: "Data Agent",
        description: "Analyze datasets, generate visualizations, and extract insights from structured data.",
        icon: BarChart3,
        color: "#3b82f6",
        gradient: "from-blue-600/20 to-indigo-600/20",
    },
];

export function AgentsClient({ workspaceId, initialAgents }: AgentsClientProps) {
    const [agents, setAgents] = useState<Agent[]>(initialAgents);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleToggle = async (agentId: string) => {
        try {
            const result = await toggleAgent(agentId);
            setAgents((prev) =>
                prev.map((a) =>
                    a.id === agentId ? { ...a, enabled: result.enabled } : a
                )
            );
        } catch (error: any) {
            notifications.show({
                title: "Error",
                message: error.message || "Failed to toggle agent",
                color: "red",
            });
        }
    };

    const handleDelete = async (agentId: string) => {
        try {
            await deleteAgent(agentId);
            setAgents((prev) => prev.filter((a) => a.id !== agentId));
            notifications.show({
                title: "Agent deleted",
                message: "The agent has been removed",
                color: "green",
            });
        } catch (error: any) {
            notifications.show({
                title: "Delete failed",
                message: error.message || "Please try again",
                color: "red",
            });
        }
    };

    const handleCreated = (agent: Agent) => {
        setAgents((prev) => [agent, ...prev]);
        setDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Agents"
                description="Configure AI agents to automate tasks and enhance your workspace."
                actions={
                    <Button
                        onClick={() => setDialogOpen(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Agent
                    </Button>
                }
            />

            {/* Active Agents */}
            {agents.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                        Your Agents
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {agents.map((agent, i) => (
                            <div
                                key={agent.id}
                                className={cn(
                                    "animate-slideUp opacity-0",
                                    `animate-delay-${Math.min((i + 1) * 100, 500)}`
                                )}
                            >
                                <AgentCard
                                    agent={agent}
                                    onToggle={() => handleToggle(agent.id)}
                                    onDelete={() => handleDelete(agent.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions — shown when no agents or as inspiration */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    {agents.length === 0 ? "Get Started with Agents" : "Explore Agent Types"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {agentTypeSuggestions.map((suggestion, i) => {
                        const SuggestionIcon = suggestion.icon;
                        const alreadyCreated = agents.some((a) => a.type === suggestion.type);

                        return (
                            <div
                                key={suggestion.type}
                                className={cn(
                                    "glass-card rounded-2xl p-5 relative overflow-hidden group animate-slideUp opacity-0",
                                    `animate-delay-${Math.min((i + 1) * 100, 500)}`,
                                    alreadyCreated && "opacity-60"
                                )}
                            >
                                {/* Background glow */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(300px circle at 50% 50%, ${suggestion.color}08, transparent 70%)`,
                                    }}
                                />

                                <div className="relative z-10">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={cn(
                                                "w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0",
                                                suggestion.gradient
                                            )}
                                        >
                                            <SuggestionIcon
                                                className="w-5.5 h-5.5"
                                                style={{ color: suggestion.color }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-semibold text-zinc-200">
                                                    {suggestion.name}
                                                </h4>
                                                {alreadyCreated && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                                                        CREATED
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-zinc-500 leading-relaxed">
                                                {suggestion.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Empty state for when there are no agents at all */}
            {agents.length === 0 && (
                <div className="glass-card rounded-2xl p-6 text-center animate-slideUp opacity-0 animate-delay-500">
                    <p className="text-sm text-zinc-400">
                        Create your first agent to start automating tasks in this workspace.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-3">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-700" />
                        <Bot className="w-4 h-4 text-zinc-600" />
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-700" />
                    </div>
                </div>
            )}

            <CreateAgentDialog
                workspaceId={workspaceId}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onCreated={handleCreated}
            />
        </div>
    );
}
