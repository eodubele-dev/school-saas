"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { generatePaystackLink } from "@/lib/actions/finance"
import confetti from 'canvas-confetti'

export function PaymentButton({ amount, email }: { amount: number, email: string }) {
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        setLoading(true)
        try {
            const link = await generatePaystackLink("Student", amount, email)
            // In a real app with integration, we would redirect or open modal
            // For now, we simulate the link generation
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

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02]"
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <CreditCard className="mr-2 h-4 w-4" />
            )}
            Pay with Paystack
        </Button>
    )
}
