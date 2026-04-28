"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, Minus } from "lucide-react"
import { adjustSmsBalance } from "@/lib/actions/admin"
import { toast } from "sonner"

interface AdminSmsAdjustModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    tenant: { id: string, name: string, sms_balance: number } | null
    onSuccess: () => void
}

export function AdminSmsAdjustModal({ open, onOpenChange, tenant, onSuccess }: AdminSmsAdjustModalProps) {
    const [loading, setLoading] = React.useState(false)
    const [amount, setAmount] = React.useState<string>("")
    const [reason, setReason] = React.useState<string>("Technical reconciliation")
    const [mode, setMode] = React.useState<'add' | 'subtract'>('add')

    const handleAdjust = async () => {
        if (!tenant) return
        setLoading(true)
        
        const adjustAmount = mode === 'add' ? Number(amount) : -Number(amount)
        
        try {
            const res = await adjustSmsBalance(tenant.id, adjustAmount, reason)
            if (res.success) {
                toast.success(`Successfully adjusted balance for ${tenant.name}`)
                onSuccess()
                onOpenChange(false)
                setAmount("")
            } else {
                toast.error(res.error || "Failed to adjust balance")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Adjust SMS Balance</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Manually credit or debit units for {tenant?.name}.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex p-1 bg-slate-900 rounded-lg border border-slate-800">
                        <button 
                            onClick={() => setMode('add')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'add' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Plus size={16} /> Add Units
                        </button>
                        <button 
                            onClick={() => setMode('subtract')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'subtract' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Minus size={16} /> Subtract
                        </button>
                    </div>

                    <div className="space-y-2">
                        <Label>Amount (Units)</Label>
                        <Input 
                            type="number" 
                            placeholder="e.g. 2000" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-slate-900 border-slate-800 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Reason / Reference</Label>
                        <Input 
                            placeholder="e.g. Payment verified via Paystack dashboard" 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="bg-slate-900 border-slate-800 focus:ring-blue-500"
                        />
                    </div>

                    <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                        <p className="text-[11px] text-blue-400 leading-relaxed italic">
                            Current Balance: {tenant?.sms_balance || 0} Units <br/>
                            New Balance: {(tenant?.sms_balance || 0) + (mode === 'add' ? Number(amount) : -Number(amount))} Units
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button 
                        onClick={handleAdjust} 
                        disabled={loading || !amount}
                        className={mode === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Confirm Adjustment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
