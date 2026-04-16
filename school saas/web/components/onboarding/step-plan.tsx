'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Sparkles, Zap, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface StepPlanProps {
    data: any
    updateData: (key: string, value: any) => void
    onSubmit: (initialDeposit?: number) => void
    onBack: () => void
    isSubmitting: boolean
}

export function StepPlan({ data, updateData, onSubmit, onBack, isSubmitting }: StepPlanProps) {
    const [isPaying, setIsPaying] = useState(false)
    const [locationState, setLocationState] = useState('Lagos')

    useEffect(() => {
        // Fetch user location
        fetch('https://get.geojs.io/v1/ip/geo.json')
            .then(res => res.json())
            .then(data => {
                if (data.region) {
                    const stateName = data.region
                        .replace(' State', '')
                        .replace(' Federal Capital Territory', 'Abuja')
                        .trim()
                    if (stateName) setLocationState(stateName)
                }
            })
            .catch((err) => {
                console.warn('Could not detect location, defaulting to Lagos', err)
            })
    }, [])

    // Fix: Reset the local isPaying state if the parent submission fails
    useEffect(() => {
        if (!isSubmitting) {
            setIsPaying(false)
        }
    }, [isSubmitting])

    const plans = [
        {
            id: 'pilot',
            name: `${locationState} Pilot`,
            price: '₦0',
            period: '/ Term 1',
            description: `Free entry for ${locationState} Schools. prove value early.`,
            features: [
                'Forensic Audit Logs',
                'Bento Dashboard',
                'Revenue Engine (Recovery Hub)',
                'AI Lesson Comments',
                'Min. ₦10k SMS Wallet'
            ],
            isNew: true
        },
        {
            id: 'starter',
            name: 'Starter',
            price: '₦20,000',
            period: '/ term',
            description: 'Essential tools for small schools.',
            features: ['Student Records', 'Basic Results', 'Attendance', 'Up to 100 Students']
        },
        {
            id: 'professional',
            name: 'Professional',
            price: '₦50,000',
            period: '/ term',
            description: 'Advanced features for growing schools.',
            features: ['Everything in Starter', 'CBT Exams', 'Finance & Bursary', 'Parent Portal', 'Unlimited Students']
        },
        {
            id: 'platinum',
            name: 'Platinum',
            price: '₦150,000',
            period: '/ term',
            description: 'AI-Powered suite for elite institutions.',
            features: [
                'Everything in Professional',
                'Gemini AI Report Comments',
                'AI Lesson Planner',
                'Proprietor "God-Mode" Mobile App',
                'Dedicated Support'
            ],
            isPopular: true
        }
    ]

    const handleAction = async () => {
        if (data.plan === 'pilot' && !isPaying) {
            setIsPaying(true)
            // Pilot activation grants an automatic 10k SMS deposit
            onSubmit(10000)
            return
        }
        onSubmit()
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4" >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => {
                    const isSelected = data.plan === plan.id;
                    const isPopular = plan.isPopular;
                    const isNew = plan.isNew;

                    return (
                        <div
                            key={plan.id}
                            className={`
                                relative flex flex-col p-6 rounded-2xl border transition-all duration-200 cursor-pointer
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-blue-500'
                                    : 'border-border bg-card text-card-foreground/40 hover:border-blue-500/50 hover:bg-card text-card-foreground/50'
                                }
                            `}
                            onClick={() => {
                                if (!isPaying && !isSubmitting) updateData('plan', plan.id)
                            }}
                        >
                            {isPopular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-foreground text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                                    Recommended
                                </div>
                            )}
                            {isNew && (!isPopular) && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-foreground text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                                    Pilot Program
                                </div>
                            )}

                            <div className="mb-6 flex-1 text-center pt-2">
                                <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                                <div className="flex items-center justify-center gap-1 mb-3">
                                    <span className="text-3xl font-bold text-foreground tracking-tight">{plan.price}</span>
                                    <span className="text-sm text-muted-foreground font-medium">{plan.period}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed min-h-[40px]">
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-6 mt-auto">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                        <div className="mt-0.5 rounded-full bg-blue-500/10 p-0.5 shrink-0">
                                            <Check className="h-3 w-3 text-blue-400" />
                                        </div>
                                        <span className="leading-snug text-left">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                })}
            </div>

            <div className="bg-secondary/50 p-4 rounded-2xl border border-border text-[11px] text-muted-foreground flex gap-4">
                <Shield className="h-5 w-5 text-cyan-500 shrink-0" />
                <p>
                    {data.plan === 'pilot'
                        ? `${locationState} Pilot activation requires a minimum ₦10,000 SMS deposit. This credit is yours to use for all institutional communications.`
                        : "Payments are securely processed by Paystack. You can cancel or upgrade your plan at any time."
                    }
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    disabled={isSubmitting || isPaying}
                    className="px-8 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors border border-transparent hover:border-border font-medium"
                >
                    Back
                </button>
                <button
                    onClick={handleAction}
                    disabled={!data.plan || isSubmitting || isPaying}
                    className={`flex-1 ${data.plan === 'pilot' ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'} text-foreground font-bold h-12 rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 group`}
                >
                    {isPaying || isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isPaying ? "Verifying SMS Deposit..." : "Transmitting Setup..."}
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4 fill-white group-hover:scale-110 transition-transform" />
                            {data.plan === 'pilot' ? "Fund SMS Wallet & Activate" : "Initialize Dashboard"}
                        </>
                    )}
                </button>
            </div>
        </div >
    )
}
