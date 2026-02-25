"use client"

import { TrendingDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useState, useTransition } from "react"
import { nudgeDebtors } from "@/lib/actions/communication"

export function NudgeButton() {
    const [isPending, startTransition] = useTransition()

    const handleNudge = () => {
        startTransition(async () => {
            try {
                const res = await nudgeDebtors()
                if (res.success) {
                    toast.success("Nudge Complete", {
                        description: res.message || `Successfully sent reminders to ${res.count} debtors.`,
                        duration: 5000,
                    })
                } else {
                    toast.error("Nudge Failed", {
                        description: res.error || "An unexpected error occurred while sending reminders.",
                    })
                }
            } catch (err) {
                toast.error("System Error", {
                    description: "Failed to connect to the communication service.",
                })
            }
        })
    }

    return (
        <button
            id="nudge-debtors-btn"
            disabled={isPending}
            onClick={handleNudge}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-md text-sm font-medium hover:bg-rose-500/20 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <TrendingDown className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
            {isPending ? "Queuing Reminders..." : "Nudge Debtors"}
        </button>
    )
}
