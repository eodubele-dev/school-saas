"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { generatePaystackLink } from "@/lib/actions/finance"
import confetti from "canvas-confetti"

export function ResultGatekeeper({ isPaid, balance, email, children }: { isPaid: boolean, balance: number, email: string, children: React.ReactNode }) {
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        setLoading(true)
        try {
            const link = await generatePaystackLink("Student", balance, email)

            toast.success("Payment Initiated", {
                description: "Redirecting to Paystack secure checkout...",
            })

            // Simulate Success Confetti (since we can't really pay in this demo environment)
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
                window.open(link, '_blank')
                setLoading(false)
            }, 1000)
        } catch {
            toast.error("Payment Failed", { description: "Could not initialize transaction." })
            setLoading(false)
        }
    }

    if (isPaid) {
        return <>{children}</>
    }

    return (
        <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-xl border border-white/5 bg-slate-900 group">
            {/* Blurred Content */}
            <div className="absolute inset-0 filter blur-[12px] opacity-50 pointer-events-none select-none p-8">
                {children}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/60 p-6 text-center backdrop-blur-sm">
                <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Lock className="h-10 w-10 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
                <p className="text-slate-400 max-w-md mb-8">
                    Your results for this term are locked due to an outstanding balance of
                    <span className="text-white font-bold mx-1">
                        ₦{balance.toLocaleString()}
                    </span>
                    on your tuition.
                </p>

                <Button
                    className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8 text-lg shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                    onClick={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <CreditCard className="h-5 w-5 mr-2" />
                    )}
                    Pay Now to Unlock
                </Button>

                <p className="mt-4 text-xs text-slate-500">Secure payment via Paystack</p>
            </div>
        </div>
    )
}
