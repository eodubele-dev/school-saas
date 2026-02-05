"use client"

import { TrendingDown } from "lucide-react"
import { toast } from "sonner"

export function NudgeButton() {
    return (
        <button
            id="nudge-debtors-btn"
            onClick={() => {
                toast.success("Nudge Initiated", {
                    description: "Customized SMS/Email reminders are being queued for outstanding debtors.",
                    duration: 4000,
                })
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-md text-sm font-medium hover:bg-rose-500/20 transition-colors active:scale-95"
        >
            <TrendingDown className="h-4 w-4" />
            Nudge Debtors
        </button>
    )
}
