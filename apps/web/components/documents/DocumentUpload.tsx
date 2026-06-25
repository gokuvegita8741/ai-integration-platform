"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useCallback } from "react";
import { CloudUpload, Loader2, CheckCircle2, FileText, FileCode, Image as ImageIcon } from "lucide-react";

interface DocumentUploadProps {
    onUpload: (files: FileList) => void | Promise<void>;
    isUploading?: boolean;
    className?: string;
    accept?: string;
}

const fileTypeHints = [
    { icon: FileText, label: "PDF", color: "text-red-400" },
    { icon: FileText, label: "DOCX", color: "text-blue-400" },
    { icon: FileText, label: "TXT", color: "text-zinc-400" },
    { icon: FileCode, label: "MD", color: "text-emerald-400" },
    { icon: ImageIcon, label: "Images", color: "text-purple-400" },
];

export function DocumentUpload({
    onUpload,
    isUploading = false,
    className,
    accept = ".pdf,.docx,.doc,.txt,.md,.markdown,.png,.jpg,.jpeg,.gif,.webp",
}: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setUploadComplete(false);
                await onUpload(e.dataTransfer.files);
                setUploadComplete(true);
                setTimeout(() => setUploadComplete(false), 3000);
            }
        },
        [onUpload]
    );

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                setUploadComplete(false);
                await onUpload(e.target.files);
                setUploadComplete(true);
                setTimeout(() => setUploadComplete(false), 3000);
                // Reset input so same file can be uploaded again
                if (inputRef.current) inputRef.current.value = "";
            }
        },
        [onUpload]
    );

    const handleClick = () => {
        if (!isUploading) {
            inputRef.current?.click();
        }
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative group cursor-pointer animate-fadeIn",
                className
            )}
        >
            <div
                className={cn(
                    "glass-card rounded-2xl border-2 border-dashed p-8 transition-all duration-300 flex flex-col items-center text-center",
                    isDragging
                        ? "border-indigo-500/60 bg-indigo-500/[0.06] scale-[1.01]"
                        : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]",
                    isUploading && "pointer-events-none opacity-80"
                )}
            >
                {/* Icon */}
                <div
                    className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                        isDragging
                            ? "bg-indigo-500/20 scale-110"
                            : "bg-gradient-to-br from-indigo-500/15 to-purple-500/15 group-hover:from-indigo-500/20 group-hover:to-purple-500/20"
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                    ) : uploadComplete ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    ) : (
                        <CloudUpload
                            className={cn(
                                "w-7 h-7 transition-all duration-300",
                                isDragging
                                    ? "text-indigo-400 scale-110"
                                    : "text-indigo-400/80 group-hover:text-indigo-400"
                            )}
                        />
                    )}
                </div>

                {/* Title */}
                <p className="text-sm font-medium text-zinc-200 mb-1">
                    {isUploading
                        ? "Uploading..."
                        : uploadComplete
                        ? "Upload complete!"
                        : isDragging
                        ? "Drop files here"
                        : "Drag files or click to upload"}
                </p>
                <p className="text-xs text-zinc-500 mb-5">
                    {isUploading
                        ? "Please wait while your files are being processed"
                        : "Supported file types shown below"}
                </p>

                {/* Upload progress shimmer */}
                {isUploading && (
                    <div className="w-full max-w-xs mx-auto mb-4">
                        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-shimmer" />
                        </div>
                    </div>
                )}

                {/* File type hints */}
                {!isUploading && !uploadComplete && (
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        {fileTypeHints.map(({ icon: HintIcon, label, color }) => (
                            <span
                                key={label}
                                className="flex items-center gap-1 text-[10px] text-zinc-500"
                            >
                                <HintIcon className={cn("w-3 h-3", color)} />
                                {label}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Drag overlay glow */}
            {isDragging && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-indigo-500/[0.04] to-purple-500/[0.04]" />
            )}
        </div>
    );
}
