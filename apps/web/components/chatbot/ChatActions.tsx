"use client"

import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useChat, Chat } from "./ChatContext"

interface ChatActionsProps {
    chat: Chat
}

export function ChatActions({ chat }: ChatActionsProps) {
    const { renameChat, deleteChat } = useChat()
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [newTitle, setNewTitle] = useState(chat.title)

    const handleRename = () => {
        renameChat(chat.id, newTitle)
        setIsRenameDialogOpen(false)
    }

    const handleDelete = () => {
        deleteChat(chat.id)
        setIsDeleteDialogOpen(false)
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setNewTitle(chat.title)
                        setIsRenameDialogOpen(true)
                    }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsDeleteDialogOpen(true)
                        }}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle className="text-black dark:text-white">Rename Chat</DialogTitle>
                        <DialogDescription>
                            Enter a new name for this chat.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-white dark:bg-zinc-900/50 dark:text-white"
                            placeholder="Chat name"
                        />
                    </div>
                    <DialogFooter>
                        <Button size={"sm"} variant="outline" className="text-black dark:text-white text-sm" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
                        <Button size={"sm"} className="text-black dark:text-white text-sm" onClick={handleRename}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle className="text-black dark:text-white">Delete Chat?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete "{chat.title}" and remove it from your history.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button size={"sm"} variant="outline" className="text-black dark:text-white text-sm" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button size={"sm"} variant="destructive" className="text-black dark:text-white text-sm" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
