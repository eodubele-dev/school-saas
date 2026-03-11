"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wand2, UploadCloud, Check, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { autoMatchTransactions, closeDay } from "@/lib/actions/reconciliation"

export function StatementMatcher({ sessionId, onComplete }: { sessionId: string, onComplete: () => void }) {
    const [matching, setMatching] = useState(false)
    const [matches, setMatches] = useState(0)
    const [isClosed, setIsClosed] = useState(false)

    const handleAutoMatch = async () => {
        setMatching(true)
        try {
            const res = await autoMatchTransactions(sessionId)
            if (res.success) {
                setMatches(res.matchesFound || 0)
                toast.success(`AI Auto-Matched ${res.matchesFound} transactions!`)
            }
        } catch (e) {
            toast.error("Matching failed")
        } finally {
            setMatching(false)
        }
    }

    const handleCloseDay = async () => {
        try {
            await closeDay(sessionId)
            toast.success("Day Closed Successfully. Report sent to Principal.")
            setIsClosed(true)
            onComplete()
        } catch (e) {
            toast.error("Failed to close day")
        }
    }

    if (isClosed) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                    <Check className="h-10 w-10 text-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">Day Closed!</h2>
                <p className="text-muted-foreground">The Daily Financial Report has been emailed to the Principal.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>View Report</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card text-card-foreground/50 p-4 rounded-xl border border-border/50">
                <div>
                    <h3 className="text-foreground font-bold">Bank Reconciliation</h3>
                    <p className="text-sm text-muted-foreground">Match system records with bank statement.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="text-slate-300 border-border">
                        <UploadCloud className="h-4 w-4 mr-2" /> Upload Statement (PDF/CSV)
                    </Button>
                    <Button
                        onClick={handleAutoMatch}
                        disabled={matching || matches > 0}
                        className="bg-purple-600 hover:bg-purple-700 text-foreground shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-purple-500/50"
                    >
                        <Wand2 className={`h-4 w-4 mr-2 ${matching ? 'animate-spin' : ''}`} />
                        {matching ? "AI Matching..." : matches > 0 ? "Matched!" : "Auto-Match Transactions"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 h-[500px]">
                {/* Left: System Ledger */}
                <Card className="bg-card text-card-foreground border-border/50 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-border/50 bg-slate-950/50">
                        <h4 className="font-bold text-slate-300 text-sm uppercase">System Ledger (Outflow/Inflow)</h4>
                    </div>
                    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex justify-between p-3 rounded bg-secondary/50 border border-border/50 opacity-50">
                                <span className="text-sm text-muted-foreground">Transfer out - Vendor {i}</span>
                                <span className="text-sm text-foreground font-mono">₦{Math.floor(Math.random() * 50000).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right: Bank Statement */}
                <Card className="bg-card text-card-foreground border-border/50 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-border/50 bg-slate-950/50">
                        <h4 className="font-bold text-slate-300 text-sm uppercase">Bank Statement (Pending)</h4>
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border/50 m-4 rounded-xl">
                        {matches > 0 ? (
                            <div className="text-center space-y-2">
                                <Check className="h-12 w-12 text-green-500 mx-auto" />
                                <p className="text-green-400 font-bold">{matches} Transactions Matched Automatically</p>
                                <p className="text-muted-foreground">No discrepancies found.</p>
                            </div>
                        ) : (
                            <p>Upload statement to begin matching</p>
                        )}
                    </div>
                </Card>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
                <Button size="lg" className="bg-[var(--school-accent)] text-foreground w-64" onClick={handleCloseDay} disabled={matches === 0}>
                    Finalize & Send Report <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
            </div>
        </div>
    )
}
