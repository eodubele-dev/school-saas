"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Continue",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} className="border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white">
                        {cancelText}
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            onConfirm()
                            onClose()
                        }}
                        className={variant === "destructive" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[var(--school-accent)] text-white"}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
