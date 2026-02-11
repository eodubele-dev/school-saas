"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Check, Sparkles, Zap, Shield, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { upgradeTenantTier } from "@/lib/actions/billing"
import { useRouter } from "next/navigation"

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

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: '₦20,000',
            period: '/ term',
            description: 'Essential record keeping.',
            features: ['Student Enrollment', 'Attendance Tracking', 'Basic Result Printing'],
            color: 'slate'
        },
        {
            id: 'professional',
            name: 'Professional',
            price: '₦50,000',
            period: '/ term',
            description: 'Advanced academic controls.',
            features: ['Everything in Starter', 'CBT Exams', 'Bursary & Finance', 'Parent Portal'],
            color: 'emerald'
        },
        {
            id: 'platinum',
            name: 'Platinum',
            price: '₦150,000',
            period: '/ term',
            description: 'The complete AI-Powered OS.',
            features: ['Everything in Pro', 'AI Report Comments', 'Audit & Fraud Logs', 'Proprietor App'],
            isPopular: true,
            color: 'cyan'
        }
    ]

    const handleUpgrade = async () => {
        if (!selectedPlan) return

        setIsSubmitting(true)
        try {
            const res = await upgradeTenantTier(selectedPlan)
            if (res.success) {
                toast.success("Institutional Expansion Complete", {
                    description: `${tenantName} has been upgraded to ${selectedPlan.toUpperCase()}.`
                })
                router.refresh()
                onClose()
            } else {
                toast.error("Upgrade Failed", {
                    description: res.error || "Please contact support for manual activation."
                })
            }
        } catch (error) {
            toast.error("Critical Error", {
                description: "Expansion protocol interrupted."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-slate-950 border-white/10 text-white overflow-hidden p-0">
                {/* Decorative Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden grayscale opacity-20">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent" />
                </div>

                <div className="relative p-8">
                    <DialogHeader className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.3em]">Institutional Expansion</span>
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tight text-white mb-2">
                            Expand Your Command Center
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-sm">
                            Unlock high-performance modules and institutional intelligence for <span className="text-white font-bold">{tenantName}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {plans.map((plan) => {
                            const isCurrent = currentTier.toLowerCase() === plan.id
                            const isAvailable = !isCurrent && (
                                (currentTier === 'starter' && (plan.id === 'professional' || plan.id === 'platinum')) ||
                                (currentTier === 'professional' && plan.id === 'platinum') ||
                                (currentTier === 'pilot')
                            )

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => isAvailable && setSelectedPlan(plan.id)}
                                    className={`
                                        relative group p-6 rounded-2xl border transition-all duration-300
                                        ${isCurrent ? 'opacity-50 border-white/5 bg-white/[0.02] cursor-not-allowed' : ''}
                                        ${isAvailable ? 'cursor-pointer hover:border-cyan-500/50 hover:bg-white/[0.03]' : 'cursor-not-allowed opacity-30'}
                                        ${selectedPlan === plan.id ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-white/5'}
                                    `}
                                >
                                    {plan.isPopular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                                            Recommended
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                                        <div className="mt-1 flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-white">{plan.price}</span>
                                            <span className="text-[10px] text-slate-500 font-medium">{plan.period}</span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
                                        {plan.description}
                                    </p>

                                    <ul className="space-y-2 mb-6">
                                        {plan.features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-2 text-[10px] text-slate-300">
                                                <Check className="h-3 w-3 text-cyan-500 mt-0.5 shrink-0" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {isCurrent && (
                                        <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest text-center mt-auto">
                                            Current Plan
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex items-center justify-between gap-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4 text-slate-500 text-[10px] font-medium uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3 text-cyan-500" />
                                Secure Paystack Billing
                            </div>
                            <div className="h-1 w-1 rounded-full bg-slate-800" />
                            <div className="flex items-center gap-2">
                                <ArrowRight className="h-3 w-3 text-cyan-500" />
                                Instant Activation
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpgrade}
                                disabled={!selectedPlan || isSubmitting}
                                className="group relative px-8 py-2.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Initialize Expansion
                                        <Zap className="h-3.5 w-3.5 fill-current group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
