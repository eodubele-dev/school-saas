"use client"

import { useState, useEffect } from "react"
import { useAdmissionStore } from "@/lib/stores/admission-store"
import { motion, AnimatePresence } from "framer-motion"
import { BiodataStep } from "./steps/biodata-step"
import { AcademicStep } from "./steps/academic-step"
import { ParentLinkingStep } from "./steps/parent-linking-step"
import { Progress } from "@/components/ui/progress"

export function AdmissionWizard({ classes, houses }: { classes: any[], houses: string[] }) {
    const { step } = useAdmissionStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const steps = [
        { number: 1, title: "Student Biodata" },
        { number: 2, title: "Academic Info" },
        { number: 3, title: "Parent Linking" }
    ]

    const progressValue = ((step - 1) / (steps.length - 1)) * 100

    return (
        <div className="max-w-4xl mx-auto py-4 space-y-8">
            {/* Progress Header */}
            <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium text-slate-400">
                    {steps.map((s) => (
                        <span
                            key={s.number}
                            className={step >= s.number ? "text-[var(--school-accent)]" : ""}
                        >
                            Step {s.number}: {s.title}
                        </span>
                    ))}
                </div>
                <Progress value={progressValue} className="h-2 bg-slate-800" indicatorClassName="bg-[var(--school-accent)] transition-all duration-500" />
            </div>

            {/* Step Content with Transitions */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {step === 1 && <BiodataStep />}
                        {step === 2 && <AcademicStep classes={classes} houses={houses} />}
                        {step === 3 && <ParentLinkingStep />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
