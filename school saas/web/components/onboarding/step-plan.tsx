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
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={`p-4 cursor-pointer transition-all relative ${data.plan === plan.id
                                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50'
                                : 'hover:border-slate-300 hover:shadow-md'
                            }`}
                        onClick={() => updateData('plan', plan.id)}
                    >
                        {plan.isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> BEST VALUE
                            </div>
                        )}
                        <div className="text-center mb-4 pt-2">
                            <h3 className="font-bold text-slate-900">{plan.name}</h3>
                            <div className="text-2xl font-bold text-slate-900 mt-1">
                                {plan.price}
                                <span className="text-xs font-normal text-slate-500">{plan.period}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                        </div>
                        <ul className="space-y-2 mb-4">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                    <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {plan.id === 'platinum' && (
                            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1 w-full rounded-full opacity-50 mb-2" />
                        )}
                    </Card>
                ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-500 flex gap-3">
                <Shield className="h-5 w-5 text-slate-400 shrink-0" />
                <p>
                    Payments are securely processed by Paystack. You can cancel or upgrade your plan at any time.
                    Opting for <strong>Platinum</strong> unlocks advanced AI capabilities immediately.
                </p>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="w-1/3">Back</Button>
                <Button onClick={onSubmit} className="flex-1 bg-green-600 hover:bg-green-700" disabled={!data.plan || isSubmitting}>
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Setting up School...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 fill-current" /> Launch Dashboard
                        </div>
                    )}
                </Button>
            </div>
        </div>
    )
}
