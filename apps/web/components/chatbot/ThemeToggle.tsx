"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="icon"
                className="w-full justify-start px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute top-0 left-0 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </div>
                    <span className="text-sm font-medium">
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                </div>
                <div className="ml-auto">
                    {/* Simple toggle visual */}
                    <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${theme === 'dark' ? 'left-5' : 'left-1'}`} />
                    </div>
                </div>
            </Button>
        </div>
    )
}
