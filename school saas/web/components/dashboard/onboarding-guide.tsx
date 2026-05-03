"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, ChevronRight, ChevronLeft, X, Sparkles, Rocket, ShieldCheck, Banknote, Users, School } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface Step {
    title: string
    note: string
    why: string
    icon: any
    link: string
    actionText: string
}

const ONBOARDING_STEPS: Step[] = [
    {
        title: "Identity & Branding",
        note: "First impressions matter. Let’s make this dashboard feel like home.",
        why: "This personalizes the portal for your staff, parents, and students, ensuring the school's identity is reflected on every invoice and report card.",
        icon: Sparkles,
        link: "/dashboard/admin/setup", // Assuming settings is under setup or campus
        actionText: "Upload Logo & Colors"
    },
    {
        title: "Academic Pulse",
        note: "Every school needs a clock. Let’s set yours.",
        why: "The system uses this 'Active Session' to anchor all future records, from student attendance to exam results.",
        icon: Rocket,
        link: "/dashboard/admin/setup",
        actionText: "Set Academic Session"
    },
    {
        title: "Structural Blueprint",
        note: "Define the rooms in your digital building.",
        why: "You cannot admit students without having classes to put them in. This step builds the directory for your entire institution.",
        icon: School,
        link: "/dashboard/admin/setup",
        actionText: "Create Classes & Levels"
    },
    {
        title: "Staff & Faculty",
        note: "Empower your team to help you manage.",
        why: "Delegating access early allows teachers to start preparing lesson plans and bursars to begin configuring fee structures.",
        icon: Users,
        link: "/dashboard/admin/staff",
        actionText: "Add Teachers"
    },
    {
        title: "Financial Architecture",
        note: "Ensure the school stays profitable and organized.",
        why: "This automates your billing. Once students are admitted, the system will instantly generate their invoices.",
        icon: Banknote,
        link: "/dashboard/admin/finance/setup",
        actionText: "Configure Fee Structure"
    },
    {
        title: "Communication & Wallet",
        note: "Keep the conversation going with parents.",
        why: "Real-time notifications are the #1 feature parents value. Having a funded wallet ensures they receive instant alerts.",
        icon: ShieldCheck,
        link: "/dashboard/admin/finance/sms",
        actionText: "Top up SMS Wallet"
    }
]

export function OnboardingGuide({ subdomain }: { subdomain: string }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(true)

    useEffect(() => {
        const dismissed = localStorage.getItem(`onboarding_dismissed_${subdomain}`)
        if (!dismissed) {
            setIsVisible(true)
            setIsDismissed(false)
        }
    }, [subdomain])

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem(`onboarding_dismissed_${subdomain}`, "true")
        setTimeout(() => setIsDismissed(true), 500)
    }

    const nextStep = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            handleDismiss()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    if (isDismissed) return null

    const step = ONBOARDING_STEPS[currentStep]
    const Icon = step.icon
    const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

    return (
        <div className={cn(
            "fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 transition-all duration-500",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        )}>
            <Card className="w-full max-w-2xl bg-black/80 backdrop-blur-xl border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                
                <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                        <div className="hidden md:flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Icon className="h-8 w-8 animate-pulse" />
                        </div>
                        
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                                        Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
                                        {step.title}
                                        <Sparkles className="h-4 w-4 text-amber-400" />
                                    </h3>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-white/40 hover:text-white hover:bg-white/5 -mt-2"
                                    onClick={handleDismiss}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-slate-200 font-medium">
                                    {step.note}
                                </p>
                                <p className="text-xs text-slate-400 leading-relaxed italic">
                                    &quot;{step.why}&quot;
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-transparent border-white/10 text-white hover:bg-white/5"
                                        onClick={prevStep}
                                        disabled={currentStep === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Back
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-transparent border-white/10 text-white hover:bg-white/5"
                                        onClick={nextStep}
                                    >
                                        {currentStep === ONBOARDING_STEPS.length - 1 ? "Finish" : "Later"}
                                        {currentStep !== ONBOARDING_STEPS.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                                    </Button>
                                </div>

                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
                                >
                                    <Link href={step.link}>
                                        {step.actionText}
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
