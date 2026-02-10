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
import { Zap, CreditCard, Loader2, MessageSquare, ShieldCheck } from "lucide-react"
import { generatePaystackLink } from "@/lib/actions/finance"
import { toast } from "sonner"

const TOPUP_OPTIONS = [
    { amount: 5000, label: "Starter Pack", est: "~1,000 SMS" },
    { amount: 10000, label: "Institutional", est: "~2,000 SMS" },
    { amount: 25000, label: "Platinum Bulk", est: "~5,000 SMS" },
]

interface SMSWalletModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SMSWalletModal({ open, onOpenChange }: SMSWalletModalProps) {
    const [loading, setLoading] = React.useState(false)
    const [amount, setAmount] = React.useState<number>(10000)
    const [customAmount, setCustomAmount] = React.useState<string>("")
    const [isCustom, setIsCustom] = React.useState(false)

    const handleTopUp = async () => {
        setLoading(true)
        try {
            const finalAmount = isCustom ? Number(customAmount) : amount

            if (!finalAmount || finalAmount < 1000) {
                toast.error("Minimum top-up amount is ₦1,000")
                setLoading(false)
                return
            }

            const link = await generatePaystackLink("admin", finalAmount, "")
            toast.success("Checkout initialized. Closing window...")

            // Close modal immediately after starting redirect/popup to avoid staled state
            onOpenChange(false)
            setLoading(false)

            // Open payment link
            window.open(link, "_blank")
        } catch (error) {
            toast.error("Failed to initialize payment gateway.")
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white sm:max-w-[450px] overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <Zap className="h-5 w-5 text-cyan-400" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight text-white">Institutional Wallet</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400 text-sm leading-relaxed">
                        Funding your wallet restores <span className="text-white font-medium">automated revenue recovery</span> and direct institutional communication channels.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 gap-3">
                        {TOPUP_OPTIONS.map((opt) => (
                            <button
                                key={opt.amount}
                                onClick={() => {
                                    setAmount(opt.amount)
                                    setIsCustom(false)
                                }}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${!isCustom && amount === opt.amount
                                    ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_4px_20px_rgba(0,245,255,0.1)]"
                                    : "bg-white/5 border-white/5 hover:bg-white/10"
                                    }`}
                            >
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white">{opt.label}</p>
                                    <p className="text-[10px] text-slate-500 font-mono italic">{opt.est}</p>
                                </div>
                                <p className="text-lg font-black text-white">₦{opt.amount.toLocaleString()}</p>
                            </button>
                        ))}

                        <button
                            onClick={() => setIsCustom(true)}
                            className={`p-4 rounded-xl border transition-all text-left ${isCustom
                                ? "bg-cyan-500/10 border-cyan-500/50"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                        >
                            <p className="text-sm font-bold text-white">Custom Amount</p>
                            {isCustom && (
                                <div className="mt-3 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₦</span>
                                    <Input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder="Min: 1,000"
                                        className="bg-black/40 border-white/10 pl-8 focus-visible:ring-cyan-500/50 text-white"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-2">
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <MessageSquare className="h-3 w-3 text-cyan-400" />
                            <span className="text-[10px] text-slate-400">Instant Delivery</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                            <ShieldCheck className="h-3 w-3 text-emerald-400" />
                            <span className="text-[10px] text-slate-400">Forensic Audit</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-slate-500 hover:text-white hover:bg-white/5"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTopUp}
                        disabled={loading || (isCustom && (!customAmount || Number(customAmount) < 1000))}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 shadow-lg shadow-cyan-900/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Initializing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay via Paystack
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
