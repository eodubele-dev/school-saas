"use client"

import { useState } from "react"
import { ClassesArmsStep } from "./steps/step-1-classes-arms"
import { SubjectRegistryStep } from "./steps/step-2-subjects"
import { GradingConfigStep } from "./steps/step-3-grading"
import { cn } from "@/lib/utils"

export function AcademicWizard({ domain }: { domain: string }) {
    const [step, setStep] = useState(1)

    const steps = [
        { number: 1, title: "Class & Arm Manager", component: <ClassesArmsStep onNext={() => setStep(2)} /> },
        { number: 2, title: "Subject Registry", component: <SubjectRegistryStep onNext={() => setStep(3)} onPrev={() => setStep(1)} /> },
        { number: 3, title: "Grading Scale Config", component: <GradingConfigStep onPrev={() => setStep(2)} /> }
    ]

    return (
        <div className="flex flex-col h-full">
            {/* Step Indicator */}
            <div className="flex border-b border-white/10 bg-slate-900/50 px-6 py-4">
                {steps.map((s, idx) => (
                    <div key={s.number} className="flex items-center">
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer",
                            step === s.number
                                ? "bg-[var(--school-accent)]/10 text-[var(--school-accent)] border border-[var(--school-accent)]/20"
                                : step > s.number
                                    ? "text-slate-400"
                                    : "text-slate-600"
                        )}
                            onClick={() => step > s.number && setStep(s.number)}
                        >
                            <span className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                                step === s.number ? "bg-[var(--school-accent)] text-white" : "bg-slate-800 text-slate-500"
                            )}>
                                {s.number}
                            </span>
                            {s.title}
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="w-12 h-[1px] bg-slate-800 mx-2" />
                        )}
                    </div>
                ))}
            </div>

            {/* Content Content - Overflow handled by parent */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--school-accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ backgroundColor: 'rgb(var(--school-accent-rgb) / 0.05)' }} />

                <div className="max-w-5xl mx-auto space-y-8 relative z-10">
                    {steps.find(s => s.number === step)?.component}
                </div>
            </div>
        </div>
    )
}
