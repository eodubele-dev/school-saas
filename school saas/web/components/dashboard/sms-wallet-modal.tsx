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

            const link = await generatePaystackLink("admin", finalAmount, "", window.location.origin)
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
            <DialogContent className="bg-[#09090b] border-white/10 text-foreground sm:max-w-[420px] overflow-hidden p-0 shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

                <div className="p-6 pb-2">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">Institutional SMS Wallet (Live)</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm leading-relaxed mt-2">
                            Top up your balance to maintain automated revenue recovery and direct communication channels. <br />
                            <span className="text-blue-400/80 font-mono text-[11px] uppercase tracking-wider">Rate: 1 Unit per SMS (₦5.00/unit)</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="space-y-4 px-6 py-2">
                    <div className="grid grid-cols-1 gap-2.5">
                        {TOPUP_OPTIONS.map((opt) => (
                            <button
                                key={opt.amount}
                                onClick={() => {
                                    setAmount(opt.amount)
                                    setIsCustom(false)
                                }}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 outline-none ${!isCustom && amount === opt.amount
                                    ? "bg-zinc-900 border-zinc-500 ring-1 ring-zinc-500 shadow-sm"
                                    : "bg-transparent border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                                    }`}
                            >
                                <div className="text-left">
                                    <p className="text-sm font-medium text-zinc-100">{opt.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{opt.est}</p>
                                </div>
                                <p className="text-base font-semibold text-zinc-100">₦{opt.amount.toLocaleString()}</p>
                            </button>
                        ))}

                        <button
                            onClick={() => setIsCustom(true)}
                            className={`p-3.5 rounded-xl border transition-all duration-200 outline-none text-left ${isCustom
                                ? "bg-zinc-900 border-zinc-500 ring-1 ring-zinc-500 shadow-sm"
                                : "bg-transparent border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                                }`}
                        >
                            <div className="flex justify-between items-center w-full">
                                <p className="text-sm font-medium text-zinc-100">Custom Amount</p>
                            </div>
                            {isCustom && (
                                <div className="mt-3 relative" onClick={(e) => e.stopPropagation()}>
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₦</span>
                                    <Input
                                        type="number"
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder="Min: 1,000"
                                        className="bg-zinc-950 border-white/10 pl-8 focus-visible:ring-1 focus-visible:ring-zinc-400 text-foreground h-10 shadow-inner"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center justify-between px-1 pt-2 pb-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Instant Delivery</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                            <span>Secured by Paystack</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-2 pb-6 flex gap-3 mt-1 bg-zinc-950 border-t border-white-[0.05]">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-zinc-300 font-medium"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleTopUp}
                        disabled={loading || (isCustom && (!customAmount || Number(customAmount) < 1000))}
                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all duration-200"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2 opacity-70" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Continue to Payment
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
