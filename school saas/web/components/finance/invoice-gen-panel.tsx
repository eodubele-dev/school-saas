"use client"

import { useState } from "react"
import { Zap, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { generateTermlyInvoices } from "@/lib/actions/finance"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function InvoiceGenerationPanel({ activeSession, domain }: { activeSession: any, domain: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleGenerate = async () => {
        if (!activeSession) return toast.error("No active session found. Set one in Academic Setup.")
        if (!confirm(`Generate invoices for ${activeSession.term} ${activeSession.session}? This creates pending invoices for ALL active students.`)) return

        setLoading(true)
        const res = await generateTermlyInvoices(domain)
        if (res.success) {
            toast.success(`Generated ${res.count} invoices!`)
            setResult(res)
            router.refresh()
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    return (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-[var(--school-accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    One-Click Invoicing
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Automatically generate bills for all students based on the active matrix.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Period</p>
                            {activeSession ? (
                                <p className="text-lg font-bold text-white mt-1">{activeSession.term} {activeSession.session}</p>
                            ) : (
                                <p className="text-red-400 text-sm mt-1">Not Set</p>
                            )}
                        </div>
                        <div className="h-8 w-8 rounded-full bg-[var(--school-accent)]/10 flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 text-[var(--school-accent)] animate-[spin_10s_linear_infinite]" />
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !activeSession}
                        className="w-full h-12 text-base font-bold bg-[var(--school-accent)] text-white hover:brightness-110 shadow-lg shadow-[var(--school-accent)]/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
                            </>
                        ) : (
                            "Generate Termly Invoices"
                        )}
                    </Button>

                    {result && (
                        <div className="text-center text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-emerald-400 font-medium">Successfully generated {result.count} invoices.</p>
                            {result.skipped > 0 && <p className="text-orange-400">{result.skipped} students skipped (missing class/fees).</p>}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
