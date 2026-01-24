"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ComponentPropsWithoutRef } from "react";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headings
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mt-6 mb-4 text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mt-5 mb-3 text-zinc-900 dark:text-zinc-100">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base font-semibold mt-3 mb-2 text-zinc-900 dark:text-zinc-100">
                            {children}
                        </h4>
                    ),

                    // Paragraphs
                    p: ({ children }) => (
                        <p className="my-3 leading-7 text-zinc-700 dark:text-zinc-300">
                            {children}
                        </p>
                    ),

                    // Lists
                    ul: ({ children }) => (
                        <ul className="my-3 ml-6 list-disc space-y-1 text-zinc-700 dark:text-zinc-300">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-3 ml-6 list-decimal space-y-1 text-zinc-700 dark:text-zinc-300">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-7 pl-1">{children}</li>
                    ),

                    // Links
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-500 hover:text-indigo-600 underline underline-offset-2"
                        >
                            {children}
                        </a>
                    ),

                    // Strong and emphasis
                    strong: ({ children }) => (
                        <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),

                    // Code blocks
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const isInline = !match && !className;

                        if (isInline) {
                            return (
                                <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 text-[13px] font-mono">
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code
                                className={`block overflow-x-auto ${className}`}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="my-4 p-4 rounded-xl bg-zinc-900 dark:bg-zinc-950 text-zinc-100 overflow-x-auto text-[13px] font-mono leading-relaxed border border-zinc-800">
                            {children}
                        </pre>
                    ),

                    // Blockquotes
                    blockquote: ({ children }) => (
                        <blockquote className="my-4 pl-4 border-l-4 border-indigo-500 bg-zinc-50 dark:bg-zinc-900/50 py-2 pr-4 rounded-r-lg text-zinc-600 dark:text-zinc-400 italic">
                            {children}
                        </blockquote>
                    ),

                    // Tables
                    table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <table className="w-full text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-100">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                            {children}
                        </td>
                    ),

                    // Horizontal rule
                    hr: () => (
                        <hr className="my-6 border-zinc-200 dark:border-zinc-700" />
                    ),

                    // Images
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt || ""}
                            className="my-4 rounded-lg max-w-full h-auto"
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
