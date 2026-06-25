"use client";

import { cn } from "@/lib/utils";
import { Search, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    loading?: boolean;
    className?: string;
    autoFocus?: boolean;
}

export function SearchInput({
    value,
    onChange,
    placeholder = "Search...",
    debounceMs = 300,
    loading = false,
    className,
    autoFocus = false,
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            onChange(newValue);
        }, debounceMs);
    };

    const handleClear = () => {
        setLocalValue("");
        onChange("");
        inputRef.current?.focus();
    };

    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
                ref={inputRef}
                type="text"
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full h-10 pl-10 pr-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-500 outline-none transition-all duration-200 focus:bg-white/[0.06] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
            />
            {loading ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
            ) : localValue ? (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            ) : null}
        </div>
    );
}
