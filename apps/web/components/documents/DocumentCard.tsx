"use client";

import { cn } from "@/lib/utils";
import {
    FileText,
    FileCode,
    Image as ImageIcon,
    File,
    MoreVertical,
    Pencil,
    Trash2,
    Clock,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Document } from "@/actions/document";

interface DocumentCardProps {
    document: Document;
    onRename?: (documentId: string) => void;
    onDelete?: (documentId: string) => void;
    className?: string;
}

function getFileTypeConfig(type: string): {
    icon: typeof FileText;
    color: string;
    bgColor: string;
} {
    const normalized = type.toLowerCase();

    if (normalized.includes("pdf")) {
        return { icon: FileText, color: "text-red-400", bgColor: "bg-red-500/10" };
    }
    if (normalized.includes("doc") || normalized.includes("docx")) {
        return { icon: FileText, color: "text-blue-400", bgColor: "bg-blue-500/10" };
    }
    if (normalized.includes("txt") || normalized.includes("text")) {
        return { icon: FileText, color: "text-zinc-400", bgColor: "bg-zinc-500/10" };
    }
    if (normalized.includes("md") || normalized.includes("markdown")) {
        return { icon: FileCode, color: "text-emerald-400", bgColor: "bg-emerald-500/10" };
    }
    if (
        normalized.includes("png") ||
        normalized.includes("jpg") ||
        normalized.includes("jpeg") ||
        normalized.includes("gif") ||
        normalized.includes("webp") ||
        normalized.includes("image")
    ) {
        return { icon: ImageIcon, color: "text-purple-400", bgColor: "bg-purple-500/10" };
    }

    return { icon: File, color: "text-zinc-400", bgColor: "bg-zinc-500/10" };
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

export function DocumentCard({ document: doc, onRename, onDelete, className }: DocumentCardProps) {
    const { icon: TypeIcon, color: iconColor, bgColor } = getFileTypeConfig(doc.type);

    return (
        <div
            className={cn(
                "group glass-card rounded-xl p-4 card-hover relative overflow-hidden",
                className
            )}
        >
            <div className="flex items-start gap-3">
                {/* File type icon */}
                <div
                    className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        bgColor
                    )}
                >
                    <TypeIcon className={cn("w-5 h-5", iconColor)} />
                </div>

                {/* File info */}
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                        {doc.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-zinc-500">
                            {formatFileSize(doc.size)}
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-zinc-600" />
                        <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                            <Clock className="w-2.5 h-2.5" />
                            {formatRelativeTime(doc.uploadedAt)}
                        </span>
                    </div>
                </div>

                {/* Actions dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white/[0.06] transition-all duration-200 outline-none">
                            <MoreVertical className="w-4 h-4 text-zinc-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="min-w-[140px] bg-zinc-900/95 backdrop-blur-2xl border-white/[0.08]"
                    >
                        {onRename && (
                            <DropdownMenuItem
                                onClick={() => onRename(doc.id)}
                                className="text-zinc-300 focus:text-zinc-100 focus:bg-white/[0.06] cursor-pointer"
                            >
                                <Pencil className="w-4 h-4" />
                                Rename
                            </DropdownMenuItem>
                        )}
                        {onRename && onDelete && <DropdownMenuSeparator className="bg-white/[0.06]" />}
                        {onDelete && (
                            <DropdownMenuItem
                                onClick={() => onDelete(doc.id)}
                                variant="destructive"
                                className="cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Status badge */}
            <div className="mt-3 flex items-center justify-between">
                <StatusBadge status={doc.status} />
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">
                    {doc.type}
                </span>
            </div>
        </div>
    );
}
