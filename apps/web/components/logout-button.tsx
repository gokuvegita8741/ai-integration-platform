"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
    return (
        <Button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            variant="destructive"
            size={"sm"}
            className="text-xs px-2 py-0"
        >
            Sign Out
        </Button>
    );
}
