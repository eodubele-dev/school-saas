"use client"

import { Lock, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function ResultBlurOverlay({ amount = 50000 }: { amount?: number }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handlePay = async () => {
        setLoading(true)
        // Simulate Paystack Popup
        toast.info("Initializing Paystack Checkout...")

        setTimeout(() => {
            // In a real integration, this would be the callback from Paystack
            // For the demo: verify transaction -> update invoice -> reload page
            toast.success("Payment Received! Result Unlocked.")
            setLoading(false)
            // Trigger a revalidation or refresh to clear the blur
            // Since we can't easily effect the server state in this client component demo without a real backend payment hook,
            // we might just reload the page and hope the demo script has "Paid" the invoice in the background 
            // OR we dispatch a simulated "mark as paid" action for the demo effect.
            router.refresh()
        }, 2000)
    }

    return (
        <div className="absolute inset-0 z-50 backdrop-blur-md bg-slate-900/60 flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-50 duration-500">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                    <Lock className="w-10 h-10 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Result Restricted</h2>
                    <p className="text-slate-400">
                        This result is accessible but hidden because there are outstanding tuition fees for this term.
                    </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-slate-500">Outstanding Balance</span>
                        <span className="text-white font-mono">NGN {amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-full animate-pulse"></div>
                    </div>
                </div>

                <Button
                    onClick={handlePay}
                    disabled={loading}
                    className="w-full bg-[#00C3F7] hover:bg-[#00C3F7]/90 text-black font-bold h-12"
                >
                    {loading ? "Processing..." : (
                        <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Now via Paystack
                        </>
                    )}
                </Button>

                <p className="text-xs text-slate-500">
                    Your result will automatically unblur immediately after payment.
                </p>
            </div>
        </div>
    )
}
