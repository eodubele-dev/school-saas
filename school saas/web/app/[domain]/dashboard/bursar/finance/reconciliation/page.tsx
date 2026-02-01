"use client"

import { useState, useEffect } from "react"
import { CashCountWizard } from "@/components/bursar/reconciliation/cash-count-wizard"
import { StatementMatcher } from "@/components/bursar/reconciliation/statement-matcher"
import { getTodaysSession } from "@/lib/actions/reconciliation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function ReconciliationPage() {
    const [step, setStep] = useState<'loading' | 'cash' | 'bank' | 'done'>('loading')
    const [session, setSession] = useState<any>(null)

    useEffect(() => {
        async function init() {
            try {
                const res = await getTodaysSession()
                if (res.success && res.session) {
                    setSession(res.session)
                    // Determine step based on session status
                    if (res.session.status === 'closed') {
                        setStep('done')
                    } else if (res.session.physical_cash_total > 0) {
                        setStep('bank') // If cash count done, move to bank
                    } else {
                        setStep('cash')
                    }
                } else {
                    toast.error("Failed to initialize session")
                }
            } catch (e) {
                toast.error("Error loading session")
            } finally {
                if (step === 'loading') {
                    // handled above logic or fallthrough
                }
            }
        }
        init()
    }, [])

    if (step === 'loading') {
        return <div className="h-full flex items-center justify-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Initializing End-of-Day Protocol...</div>
    }

    return (
        <div className="flex flex-col h-full bg-slate-950 p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Daily Reconciliation Hub</h1>
                <p className="text-slate-400">End-of-Day Financial Closing for <span className="text-[var(--school-accent)] font-medium">{new Date().toDateString()}</span></p>
            </header>

            {step === 'cash' && (
                <CashCountWizard
                    sessionId={session?.id}
                    systemTotal={session?.system_cash_total || 0}
                    onComplete={() => setStep('bank')}
                />
            )}

            {step === 'bank' && (
                <StatementMatcher
                    sessionId={session?.id}
                    onComplete={() => setStep('done')}
                />
            )}

            {step === 'done' && (
                <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                    <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                        <Check className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Reconciliation Complete</h2>
                    <p className="text-slate-400 max-w-md">The books are balanced for today. Access the historical report in the archive.</p>
                </div>
            )}
        </div>
    )
}

import { Check } from "lucide-react"
