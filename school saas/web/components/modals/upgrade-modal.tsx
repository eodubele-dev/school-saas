"use client"
// Sync ID: 2026-04-20-SYNC-FORCE

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Check, Sparkles, Zap, Shield, Loader2, Star, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { changeSubscriptionTier } from "@/lib/actions/subscription"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Script from "next/script"

declare global {
    interface Window {
        PaystackPop: any;
    }
}

interface UpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    currentTier: string
    tenantName: string
}

export function UpgradeModal({ isOpen, onClose, currentTier, tenantName }: UpgradeModalProps) {
    const router = useRouter()
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userEmail, setUserEmail] = useState<string>('')
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user?.email) setUserEmail(user.email)
            })
        }
    }, [isOpen])

    const normalizedCurrentTier = currentTier?.toLowerCase() || 'starter'

    const PLAN_RANKS: Record<string, number> = {
        pilot: 0,
        starter: 1,
        professional: 2,
        platinum: 3
    }
    const currentRank = PLAN_RANKS[normalizedCurrentTier] ?? 0

    const plans = [
        {
            id: 'pilot',
            name: 'Lagos Pilot',
            price: '₦10,000',
            amountKobo: 1000000,
            period: '/ Initial Deposit',
            description: 'Fund your SMS wallet to activate. Total control from day one.',
            features: ['Up to 100 Students', 'Core Gradebook', 'System Audit Logs', '₦10,000 SMS Credit'],
        },
        {
            id: 'starter',
            name: 'Starter',
            price: '₦20,000',
            amountKobo: 2000000,
            period: '/ term',
            description: 'Essential record keeping for small schools.',
            features: ['Up to 300 Students', 'Automated Report Cards', 'Parent Portal Access', 'Global Debt Alert'],
        },
        {
            id: 'professional',
            name: 'Professional',
            price: '₦50,000',
            amountKobo: 5000000,
            period: '/ term',
            description: 'Advanced controls for growing institutions.',
            features: ['Unlimited Students', 'Bursary & Finance', 'CBT & Online Exams', 'Staff Payroll'],
        },
        {
            id: 'platinum',
            name: 'Platinum',
            price: '₦150,000',
            amountKobo: 15000000,
            period: '/ term',
            description: 'The complete AI-Powered elite OS.',
            features: ['Everything in Pro', 'AI Gemini Planner', 'Audit & Fraud Logs', 'Proprietor God-Mode App'],
            isPopular: true,
        }
    ]

    const handleUpgrade = async () => {
        const planObj = plans.find(p => p.id === selectedPlan)
        if (!planObj) return

        setIsSubmitting(true)
        
        try {
            // Safety check for Paystack SDK
            if (!window.PaystackPop) {
                toast.error("Gateway Not Ready", { 
                    description: "The payment secure channel is still initializing. Please wait 2 seconds and try again." 
                })
                setIsSubmitting(false)
                return
            }

            const publicKey = (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "").trim();
            


            if (!publicKey) {
                toast.error("Cloud Configuration Error", { 
                    description: "PAYSTACK_PUBLIC_KEY is missing in your production environment variables. Please check your hosting dashboard." 
                })
                setIsSubmitting(false)
                return
            }

            // Non-sensitive debug log for propagation check
            console.debug("[Paystack SDK] Initializing checkout with public key:", publicKey.substring(0, 10) + "...");

            const handler = window.PaystackPop.setup({
                key: publicKey,
                email: userEmail || 'admin@school.com',
                amount: planObj.amountKobo,
                currency: 'NGN',
                ref: `MODAL-UPGRADE-${Date.now()}`,
                metadata: {
                    plan: selectedPlan,
                    school: tenantName,
                    modal: true
                },
                callback: (response: any) => {
                    toast.loading("Verifying transaction and updating institutional access...", { id: 'upgrade' })
                    
                    // Call the server action and handle response
                    changeSubscriptionTier(selectedPlan!, response.reference).then((res) => {
                        if (res.success) {
                            toast.success("Institutional Expansion Complete", {
                                description: `${tenantName} has been upgraded to ${selectedPlan!.toUpperCase()}.`,
                                id: 'upgrade'
                            })
                            router.refresh()
                            setTimeout(() => window.location.reload(), 2000)
                        } else {
                            toast.error("Upgrade Failed", {
                                description: res.error || "Please contact support for manual activation.",
                                id: 'upgrade'
                            })
                            setIsSubmitting(false)
                        }
                    }).catch((err) => {
                        console.error("Verification Error:", err)
                        toast.error("Verification Fault", {
                            description: "Payment successful but system sync failed. Please contact support.",
                            id: 'upgrade'
                        })
                        setIsSubmitting(false)
                    })
                },
                onClose: () => {
                    setIsSubmitting(false)
                    toast.error("Process Interrupted", { description: "Payment is required for institutional expansion." })
                }
            })
            handler.openIframe()
        } catch (error: any) {
            console.error("Upgrade Modal Error:", error)
            toast.error("System Fault", {
                description: error.message || "The upgrade protocol encountered a connectivity issue. Please retry."
            })
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open && !isSubmitting) onClose();
            }} 
            modal={false}
        >
            <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
            <DialogContent 
                className="max-w-5xl bg-slate-950 border-border text-slate-50 overflow-hidden p-0 shadow-2xl"
            >
                <div className="relative p-8 md:p-10">
                    <DialogHeader className="mb-8 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                            <Sparkles className="h-5 w-5 text-blue-400" />
                            <span className="text-sm font-semibold text-blue-400 tracking-wide">
                                Choose Your Plan
                            </span>
                        </div>
                        <DialogTitle className="text-3xl font-bold tracking-tight text-foreground mb-2">
                            Upgrade {tenantName}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-base max-w-xl leading-relaxed">
                            Shift your institution into high-performance mode with advanced financial audits, superior logistics, and AI-powered intelligence.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {plans.map((plan) => {
                            const planRank = PLAN_RANKS[plan.id] ?? -1
                            const isCurrent = normalizedCurrentTier === plan.id
                            const isSelectable = planRank > currentRank
                            const isSelected = selectedPlan === plan.id

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => isSelectable && setSelectedPlan(plan.id)}
                                    className={`
                                        relative group flex flex-col p-6 rounded-2xl border transition-all duration-200
                                        ${isCurrent ? 'bg-card text-card-foreground border-border opacity-70' : ''}
                                        ${isSelectable ? 'cursor-pointer hover:border-blue-500/50 hover:bg-card text-card-foreground/50' : ''}
                                        ${!isSelectable && !isCurrent ? 'opacity-40 bg-card text-card-foreground/30 border-border cursor-not-allowed' : ''}
                                        ${isSelected ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-blue-500' : 'border-border bg-card text-card-foreground/40'}
                                    `}
                                >
                                    {plan.isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                            Recommended
                                        </div>
                                    )}

                                    <div className="mb-5 flex-1">
                                        <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-2">
                                            <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                                            <span className="text-xs text-muted-foreground font-medium">{plan.period}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed min-h-[40px]">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <ul className="space-y-3 mb-6 mt-auto">
                                        {plan.features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                                <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                                                <span className="leading-snug">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        {isCurrent ? (
                                            <div className="w-full py-2 text-center text-xs font-semibold text-muted-foreground bg-slate-800 rounded-lg">
                                                Current Plan
                                            </div>
                                        ) : isSelectable ? (
                                            <div className={`
                                                w-full py-2.5 text-center text-xs font-semibold rounded-lg transition-colors
                                                ${isSelected ? 'bg-blue-600 text-foreground' : 'bg-slate-800 text-foreground group-hover:bg-slate-700'}
                                            `}>
                                                {isSelected ? 'Selected' : 'Select Plan'}
                                            </div>
                                        ) : (
                                            <div className="w-full py-2 text-center text-xs font-semibold text-muted-foreground bg-card text-card-foreground rounded-lg">
                                                Unavailable
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto text-xs text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span>Paystack Secured</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-muted-foreground" />
                                <span>Instant Setup</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-muted-foreground" />
                                <span>No Hidden Fees</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-muted-foreground" />
                                <span>Cancel Anytime</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 w-full md:w-auto shrink-0">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-foreground"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpgrade}
                                disabled={!selectedPlan || isSubmitting}
                                className="bg-blue-600 text-foreground hover:bg-blue-700 disabled:bg-blue-600/50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Upgrade'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
