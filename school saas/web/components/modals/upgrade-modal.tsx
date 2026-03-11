"use client"

import { useState } from "react"
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
import { generatePaystackLink } from "@/lib/actions/finance"
import { Button } from "@/components/ui/button"

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
            price: '₦0',
            period: '/ Term 1',
            description: 'Free entry for Lagos Schools. Prove value early.',
            features: ['Up to 100 Students', 'Core Gradebook', 'System Audit Logs', 'Min. ₦10k SMS Wallet'],
        },
        {
            id: 'starter',
            name: 'Starter',
            price: '₦20,000',
            period: '/ term',
            description: 'Essential record keeping for small schools.',
            features: ['Up to 300 Students', 'Automated Report Cards', 'Parent Portal Access', 'Global Debt Alert'],
        },
        {
            id: 'professional',
            name: 'Professional',
            price: '₦50,000',
            period: '/ term',
            description: 'Advanced controls for growing institutions.',
            features: ['Unlimited Students', 'Bursary & Finance', 'CBT & Online Exams', 'Staff Payroll'],
        },
        {
            id: 'platinum',
            name: 'Platinum',
            price: '₦150,000',
            period: '/ term',
            description: 'The complete AI-Powered elite OS.',
            features: ['Everything in Pro', 'AI Gemini Planner', 'Audit & Fraud Logs', 'Proprietor God-Mode App'],
            isPopular: true,
        }
    ]

    const handleUpgrade = async () => {
        if (!selectedPlan) return

        setIsSubmitting(true)
        try {
            // 1. Simulate Payment Gateway if price > 0
            const planObj = plans.find(p => p.id === selectedPlan)
            const priceStr = planObj?.price || "0"
            const priceNum = parseInt(priceStr.replace(/[^0-9]/g, ''), 10)

            if (priceNum > 0) {
                toast.loading("Initializing secure Paystack gateway...", { id: 'payment' })
                const paymentUrl = await generatePaystackLink('admin', priceNum, 'admin@eduflow.ng')

                // Simulate waiting for gateway
                await new Promise(resolve => setTimeout(resolve, 1500))
                toast.dismiss('payment')

                // Open mock gateway in new tab
                window.open(paymentUrl, '_blank')

                toast.success("Payment Verified", {
                    description: "Secure mock transaction completed successfully."
                })
            }

            // 2. Perform Backend DB Tier Change
            const res = await changeSubscriptionTier(selectedPlan)
            if (res.success) {
                toast.success("Institutional Expansion Complete", {
                    description: `${tenantName} has been upgraded to ${selectedPlan.toUpperCase()}.`
                })
                router.refresh()
                onClose()
                window.location.reload()
            } else {
                toast.error("Upgrade Failed", {
                    description: res.error || "Please contact support for manual activation."
                })
            }
        } catch (error) {
            toast.error("Critical Error", {
                description: "Expansion protocol interrupted."
            })
            toast.dismiss('payment')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-slate-950 border-border text-slate-50 overflow-hidden p-0 shadow-2xl">
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
                            // Allow upgrading to any plan with a higher rank than the current one
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
