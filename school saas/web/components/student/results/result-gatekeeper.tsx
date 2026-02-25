"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { initiatePayment } from "@/lib/actions/paystack"
import confetti from "canvas-confetti"

export function ResultGatekeeper({ isPaid, balance, email, studentId, children }: { isPaid: boolean, balance: number, email?: string, studentId?: string, children: React.ReactNode }) {
    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        setLoading(true)
        try {
            toast.loading("Initializing secure channel...")
            // Fallback email from context or prompt user? For now use dummy if missing since backend might fetch it.
            // But initiatePayment expects email.
            // We should ideally have email passed in props. 
            // In results/page.tsx, email isn't passed.
            // We can fetch it or just pass a placeholder if the backend fills it. 
            // Our initiatePayment DOES NOT fill email if missing, it expects it in data.
            // However, initializePaystackTransaction in backend fills it from DB if missing.
            // But initiatePayment takes it as arg. Let's make it optional in initiatePayment or just pass a placeholder string that backend will ignore/overwrite?
            // Actually, backend paystack.ts: initializePaystackTransaction uses: const email = trx.student?.email || 'bursar@school.com'
            // So we can pass a dummy email if we don't have it on client.

            const res = await initiatePayment({
                amount: balance,
                email: email || "student@schoolHelper.com",
                studentId
            })

            toast.dismiss()

            if (res.success && res.url) {
                toast.success("Redirecting to Paystack...", {
                    description: "Please complete payment in the secure window.",
                })
                window.location.href = res.url
            } else {
                toast.error("Payment Init Failed", { description: res.error || "Could not start transaction." })
            }
            setLoading(false)
        } catch {
            toast.error("Connection Error", { description: "Please check your network." })
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
