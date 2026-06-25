import type { ActivityItem } from "@/actions/activity";

export const ACTION_LABELS: Record<string, string> = {
    chat_created: "Created chat",
    chat_deleted: "Deleted chat",
    workspace_created: "Created workspace",
    workspace_updated: "Updated workspace",
    document_uploaded: "Uploaded document",
    document_deleted: "Deleted document",
    agent_created: "Created agent",
    agent_updated: "Updated agent",
    agent_deleted: "Deleted agent",
    settings_updated: "Updated settings",
};

const VERB_LABELS: Record<string, string> = {
    created: "Created",
    updated: "Updated",
    deleted: "Deleted",
    uploaded: "Uploaded",
    enabled: "Enabled",
    disabled: "Disabled",
    archived: "Archived",
    restored: "Restored",
};

function titleCase(value: string): string {
    return value
        .split(/[_\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function getActivityTitle(activity: ActivityItem): string {
    if (ACTION_LABELS[activity.action]) {
        return ACTION_LABELS[activity.action];
    }

    const [entity, verb] = activity.action.split("_");
    if (entity && verb) {
        return `${VERB_LABELS[verb] ?? titleCase(verb)} ${titleCase(entity).toLowerCase()}`;
    }

    return titleCase(activity.action);
}

export function getActivitySentence(activity: ActivityItem): string {
    const title = getActivityTitle(activity);
    if (!activity.entityName) return title;
    return `${title} "${activity.entityName}"`;
}

export function formatActivityTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const absMs = Math.abs(diffMs);
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    if (absMs < minute) return "Just now";
    if (absMs < hour) return rtf.format(Math.round(diffMs / minute), "minute");
    if (absMs < day) return rtf.format(Math.round(diffMs / hour), "hour");
    if (absMs < week) return rtf.format(Math.round(diffMs / day), "day");

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
}

export function getActivityDateGroup(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfActivityDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round(
        (startOfToday.getTime() - startOfActivityDay.getTime()) / 86400000
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    return date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
    });
}

export function getMetadataEntries(activity: ActivityItem): { label: string; value: string }[] {
    if (!activity.metadata || typeof activity.metadata !== "object") return [];

    return Object.entries(activity.metadata)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => {
            const label = titleCase(key);
            if (Array.isArray(value)) {
                return { label, value: value.join(", ") };
            }
            if (typeof value === "object") {
                return { label, value: JSON.stringify(value) };
            }
            return { label, value: String(value) };
        })
        .filter((entry) => entry.value.length > 0)
        .slice(0, 3);
}
