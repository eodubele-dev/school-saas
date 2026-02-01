"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NairaIcon } from "@/components/ui/naira-icon"
import { CashCountInput, submitCashCount } from "@/lib/actions/reconciliation"
import { toast } from "sonner"
import { AlertCircle, CheckCircle, ArrowRight, Banknote } from "lucide-react"

const DENOMINATIONS = ['1000', '500', '200', '100', '50', '20', '10']

export function CashCountWizard({ sessionId, systemTotal, onComplete }: { sessionId: string, systemTotal: number, onComplete: () => void }) {
    const [counts, setCounts] = useState<Record<string, { bundles: number, loose: number }>>({})
    const [submitting, setSubmitting] = useState(false)
    const [varianceReason, setVarianceReason] = useState("")

    useEffect(() => {
        // Init counts
        const initial: any = {}
        DENOMINATIONS.forEach(d => initial[d] = { bundles: 0, loose: 0 })
        setCounts(initial)
    }, [])

    const handleChange = (denom: string, field: 'bundles' | 'loose', value: string) => {
        const num = parseInt(value) || 0
        setCounts(prev => ({
            ...prev,
            [denom]: { ...prev[denom], [field]: num }
        }))
    }

    const calculateTotal = () => {
        let total = 0
        Object.entries(counts).forEach(([denom, count]) => {
            total += parseInt(denom) * ((count.bundles * 100) + count.loose)
        })
        return total
    }

    const physicalTotal = calculateTotal()
    const variance = systemTotal - physicalTotal
    const isBalanced = variance === 0

    const handleSubmit = async () => {
        if (!isBalanced && !varianceReason && variance > 0) {
            toast.error("Please explain the missing cash variance.")
            return
        }

        setSubmitting(true)
        const payload: CashCountInput[] = Object.entries(counts).map(([d, c]) => ({ denomination: d, bundles: c.bundles, loose: c.loose }))

        try {
            const res = await submitCashCount(sessionId, payload)
            if (res.success) {
                toast.success("Cash count submitted!")
                onComplete()
            } else {
                toast.error(res.error)
            }
        } catch (e) {
            toast.error("Submission failed")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Input Side */}
                <Card className="col-span-2 p-6 bg-slate-900 border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <Banknote className="text-[var(--school-accent)] h-6 w-6" />
                        <h2 className="text-xl font-bold text-white">Cash Drawer Count</h2>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-slate-400">Note (₦)</TableHead>
                                <TableHead className="text-slate-400">Bundles (x100)</TableHead>
                                <TableHead className="text-slate-400">Loose Notes</TableHead>
                                <TableHead className="text-right text-slate-400">Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {DENOMINATIONS.map(denom => {
                                const val = parseInt(denom) * ((counts[denom]?.bundles || 0) * 100 + (counts[denom]?.loose || 0))
                                return (
                                    <TableRow key={denom} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="font-bold text-lg text-slate-300">₦{denom}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={counts[denom]?.bundles || ''}
                                                onChange={e => handleChange(denom, 'bundles', e.target.value)}
                                                className="bg-slate-950 border-white/10 text-right w-24"
                                                placeholder="0"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={counts[denom]?.loose || ''}
                                                onChange={e => handleChange(denom, 'loose', e.target.value)}
                                                className="bg-slate-950 border-white/10 text-right w-24"
                                                placeholder="0"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-slate-300">
                                            ₦{val.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Card>

                {/* 2. Validation Side */}
                <div className="space-y-6">
                    <Card className="p-6 bg-slate-900 border-white/5 flex flex-col gap-4">
                        <div>
                            <p className="text-sm text-slate-400 uppercase font-bold tracking-wider">System Expected</p>
                            <p className="text-3xl font-bold text-white flex items-center"><NairaIcon className="h-6 w-6 mr-1" />{systemTotal.toLocaleString()}</p>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <p className="text-sm text-slate-400 uppercase font-bold tracking-wider">Your Count</p>
                            <p className="text-3xl font-bold text-[var(--school-accent)] flex items-center"><NairaIcon className="h-6 w-6 mr-1" />{physicalTotal.toLocaleString()}</p>
                        </div>

                        {/* Variance Display */}
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${isBalanced ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {isBalanced ? <CheckCircle className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
                            <div>
                                <p className="font-bold uppercase text-xs">{isBalanced ? 'Balanced' : 'Discrepancy'}</p>
                                <p className="font-bold text-xl">{variance > 0 ? '-' : '+'}{Math.abs(variance).toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>

                    {!isBalanced && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <label className="text-xs text-red-400 font-bold uppercase mb-2 block">Mandatory Variance Explanation</label>
                            <textarea
                                className="w-full bg-slate-950 border-red-500/30 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                rows={3}
                                placeholder="Why is the cash short/over?"
                                value={varianceReason}
                                onChange={e => setVarianceReason(e.target.value)}
                            />
                        </div>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`w-full h-12 text-lg font-bold ${isBalanced ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        {isBalanced ? "Confirm & Balance" : "Submit with Variance"} <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
