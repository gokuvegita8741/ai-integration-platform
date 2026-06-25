"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import {
    FileText,
    Upload,
    CloudUpload,
    File,
    Trash2,
    Loader2,
    CheckCircle,
    AlertCircle,
    Clock,
    MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { uploadDocument, deleteDocument, type Document } from "@/actions/document";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

interface DocumentsClientProps {
    workspaceId: string;
    initialDocuments: Document[];
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

const fileTypeConfig: Record<string, { color: string; label: string }> = {
    pdf: { color: "#ef4444", label: "PDF" },
    docx: { color: "#3b82f6", label: "DOCX" },
    doc: { color: "#3b82f6", label: "DOC" },
    txt: { color: "#71717a", label: "TXT" },
    md: { color: "#22c55e", label: "MD" },
    csv: { color: "#f97316", label: "CSV" },
    json: { color: "#eab308", label: "JSON" },
    png: { color: "#a855f7", label: "IMG" },
    jpg: { color: "#a855f7", label: "IMG" },
    jpeg: { color: "#a855f7", label: "IMG" },
};

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    ready: { icon: CheckCircle, color: "text-emerald-400", label: "Ready" },
    processing: { icon: Loader2, color: "text-amber-400", label: "Processing" },
    error: { icon: AlertCircle, color: "text-red-400", label: "Error" },
};

export function DocumentsClient({ workspaceId, initialDocuments }: DocumentsClientProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleUpload = useCallback(
        async (files: FileList | null) => {
            if (!files || files.length === 0) return;

            setUploading(true);
            try {
                for (const file of Array.from(files)) {
                    const formData = new FormData();
                    formData.append("file", file);

                    const doc = await uploadDocument(workspaceId, formData);
                    setDocuments((prev) => [doc, ...prev]);
                }

                notifications.show({
                    title: "Upload complete",
                    message: `${files.length} file(s) uploaded successfully`,
                    color: "green",
                });
            } catch (error: any) {
                notifications.show({
                    title: "Upload failed",
                    message: error.message || "Please try again",
                    color: "red",
                });
            } finally {
                setUploading(false);
            }
        },
        [workspaceId]
    );

    const handleDelete = async (docId: string) => {
        try {
            await deleteDocument(docId);
            setDocuments((prev) => prev.filter((d) => d.id !== docId));
            notifications.show({
                title: "Document deleted",
                message: "The document has been removed",
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

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            handleUpload(e.dataTransfer.files);
        },
        [handleUpload]
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Documents"
                description="Upload and manage documents for your workspace knowledge base."
            />

            {/* Upload Zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "glass-card rounded-2xl p-8 border-2 border-dashed cursor-pointer transition-all duration-200 text-center animate-slideUp opacity-0 animate-delay-100",
                    dragOver
                        ? "border-indigo-500/50 bg-indigo-500/5"
                        : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                />
                {uploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
                        <p className="text-sm text-zinc-300">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                            <CloudUpload className="w-7 h-7 text-indigo-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-300">
                            Drag files here or click to upload
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            PDF, DOCX, TXT, MD, CSV, JSON, Images
                        </p>
                    </div>
                )}
            </div>

            {/* Documents Grid */}
            {documents.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No documents yet"
                    description="Upload your first document to build your workspace knowledge base."
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {documents.map((doc, i) => {
                        const ext = doc.name.split(".").pop()?.toLowerCase() || "";
                        const typeInfo = fileTypeConfig[ext] || { color: "#71717a", label: ext.toUpperCase() };
                        const status = statusConfig[doc.status] || statusConfig.ready;
                        const StatusIcon = status.icon;

                        return (
                            <div
                                key={doc.id}
                                className={cn(
                                    "glass-card rounded-xl p-4 card-hover group animate-slideUp opacity-0",
                                    `animate-delay-${Math.min((i + 1) * 100, 500)}`
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${typeInfo.color}15` }}
                                    >
                                        <File className="w-5 h-5" style={{ color: typeInfo.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-zinc-200 truncate">
                                            {doc.name}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                                style={{
                                                    backgroundColor: `${typeInfo.color}15`,
                                                    color: typeInfo.color,
                                                }}
                                            >
                                                {typeInfo.label}
                                            </span>
                                            <span className="text-[10px] text-zinc-600">
                                                {formatFileSize(doc.size)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                                    <div className="flex items-center gap-1">
                                        <StatusIcon
                                            className={cn(
                                                "w-3 h-3",
                                                status.color,
                                                doc.status === "processing" && "animate-spin"
                                            )}
                                        />
                                        <span className={cn("text-[10px]", status.color)}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                                        <Clock className="w-3 h-3" />
                                        {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
