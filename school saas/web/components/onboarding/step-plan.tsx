'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Sparkles, Zap, Shield } from "lucide-react"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface StepPlanProps {
    data: any
    updateData: (key: string, value: any) => void
    onSubmit: () => void
    onBack: () => void
    isSubmitting: boolean
}

export function StepPlan({ data, updateData, onSubmit, onBack, isSubmitting }: StepPlanProps) {
    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            price: '₦0',
            period: '/ month',
            description: 'Essential tools for small schools.',
            features: ['Student Records', 'Basic Results', 'Attendance', 'Up to 100 Students']
        },
        {
            id: 'pro',
            name: 'Pro',
            price: '₦20,000',
            period: '/ term',
            description: 'Advanced features for growing schools.',
            features: ['Everything in Basic', 'CBT Exams', 'Finance & Bursary', 'Parent Portal', 'Unlimited Students']
        },
        {
            id: 'platinum',
            name: 'Platinum',
            price: '₦50,000',
            period: '/ term',
            description: 'AI-Powered suite for elite institutions.',
            features: [
                'Everything in Pro',
                'Gemini AI Report Comments',
                'AI Lesson Planner',
                'Proprietor "God-Mode" Mobile App',
                'Dedicated Support'
            ],
            isPopular: true
        }
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`p-6 rounded-3xl cursor-pointer transition-all relative border ${data.plan === plan.id
                            ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]'
                            : 'bg-[#0A0A0B] border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                            }`}
                        onClick={() => updateData('plan', plan.id)}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                <Sparkles className="h-3 w-3 fill-black" /> BEST VALUE
                            </div>
                        )}
                        <div className="text-center mb-6 pt-2">
                            <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                            <div className="text-3xl font-bold text-white mt-2">
                                {plan.price}
                                <span className="text-sm font-normal text-slate-500 ml-1">{plan.period}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.description}</p>
                        </div>
                        <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                                    <Check className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {plan.id === 'platinum' && (
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1 w-full rounded-full opacity-30 mb-2" />
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-[11px] text-slate-400 flex gap-4">
                <Shield className="h-5 w-5 text-cyan-500 shrink-0" />
                <p>
                    Payments are securely processed by Paystack. You can cancel or upgrade your plan at any time.
                    Opting for <strong>Platinum</strong> unlocks advanced AI capabilities immediately.
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 font-medium"
                >
                    Back
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!data.plan || isSubmitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Transmitting Setup...
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4 fill-white group-hover:scale-110 transition-transform" />
                            Initialize Dashboard
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
