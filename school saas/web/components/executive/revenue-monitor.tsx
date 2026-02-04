'use client'

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, CheckCircle2 } from "lucide-react"
import { nudgeDebtors } from "@/lib/actions/executive"
import { toast } from "sonner"

export function RevenueMonitor({ expected, collected }: { expected: number, collected: number }) {
    const percentage = Math.round((collected / (expected || 1)) * 100)
    const [nudging, setNudging] = useState(false)

    const handleNudge = async () => {
        setNudging(true)
        const res = await nudgeDebtors()
        if (res.success) {
            toast.success("Reminders Queued", {
                description: "12 high-value debtors have been nudged via SMS."
            })
        }
        setNudging(false)
    }

    return (
        <Card className="bg-slate-900 border-white/10 p-4 space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Revenue Leakage</h3>
                    <div className="text-2xl font-bold text-white mt-1">
                        {percentage}% <span className="text-sm text-slate-500 font-normal">Collected</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500">outstanding</div>
                    <div className="text-sm font-mono text-amber-500 text-glow-cyan">
                        ₦{((expected - collected) / 1000000).toFixed(2)}M
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <Progress value={percentage} className="h-2 bg-slate-800" indicatorClassName="bg-amber-500" />
                <div className="flex justify-between text-[10px] text-slate-600 uppercase">
                    <span>₦{(collected / 1000000).toFixed(1)}M Paid</span>
                    <span>Target: ₦{(expected / 1000000).toFixed(1)}M</span>
                </div>
            </div>

            <Button
                onClick={handleNudge}
                disabled={nudging}
                className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20"
            >
                {nudging ? (
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 animate-ping" /> Sending...
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" /> Nudge Debtors (Over ₦50k)
                    </span>
                )}
            </Button>
        </Card>
    )
}
