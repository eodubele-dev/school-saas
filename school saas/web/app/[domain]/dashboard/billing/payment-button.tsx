"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { initiatePayment } from "@/lib/actions/paystack" // Updated import

export function PaymentButton({ amount, email, studentId, disabled, subdomain }: { amount: number, email: string, studentId?: string, disabled?: boolean, subdomain?: string }) {
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        setLoading(true)
        try {
            toast.loading("Initializing secure channel...")
                amount,
                email,
                studentId,
                subdomain
            })

            toast.dismiss()

            if (res.success && res.url) {
                toast.success("Redirecting to Paystack...", {
                    description: "Please complete payment in the secure window.",
                })
                window.location.href = res.url // Redirect to Paystack
            } else {
                toast.error("Payment Init Failed", { description: res.error || "Could not start transaction." })
            }
            setLoading(false)
        } catch {
            toast.error("Connection Error", { description: "Please check your network." })
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handlePayment}
            disabled={loading || disabled}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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
