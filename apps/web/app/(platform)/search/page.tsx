import { Metadata } from "next";
import { SearchPageClient } from "./search-client";

export const metadata: Metadata = {
    title: "Search — AI Workspace",
    description: "Search across all your workspaces, chats, documents, and agents.",
};

export default function SearchPage() {
    return <SearchPageClient />;
}
