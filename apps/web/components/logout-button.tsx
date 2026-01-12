"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
    return (
        <Button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            variant="destructive"
        >
            Sign Out
        </Button>
    );
}
