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
import { AlertCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive" | "warning"
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default"
}: ConfirmationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-slate-950 border-white/10 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                            "p-2 rounded-full",
                            variant === "default" && "bg-blue-500/10 text-blue-400",
                            variant === "destructive" && "bg-red-500/10 text-red-500",
                            variant === "warning" && "bg-amber-500/10 text-amber-500"
                        )}>
                            {variant === "destructive" ? <AlertTriangle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </div>
                        <DialogTitle className="text-xl font-bold text-white">{title}</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400 text-sm leading-relaxed">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-white/5 font-medium"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={cn(
                            "font-bold uppercase tracking-widest px-6",
                            variant === "default" && "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20",
                            variant === "destructive" && "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20",
                            variant === "warning" && "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20"
                        )}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
