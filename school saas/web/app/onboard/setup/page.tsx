'use client'

import { useState } from "react"
import { StepBranding } from "@/components/onboarding/step-branding"
import { StepImport } from "@/components/onboarding/step-import"
import { StepPlan } from "@/components/onboarding/step-plan"
import { createTenant } from "@/lib/actions/onboarding"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function OnboardingWizard() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [data, setData] = useState({
        schoolName: '',
        subdomain: '',
        brandColor: '#00F5FF', // Default Platinum Blue
        logo: null,
        plan: ''
    })

    const updateData = (key: string, value: any) => {
        setData(prev => ({ ...prev, [key]: value }))
    }

    const handleNext = () => setStep(prev => prev + 1)
    const handleBack = () => setStep(prev => prev - 1)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            // Note: Creating tenant might fail slightly if API expects 'levels' from StepAcademic which we removed.
            // Assuming API is robust or defaulting. If strict, we might need to send defaults.
            const payload = { ...data, levels: ['nursery', 'primary', 'jss', 'sss'] } // Default levels

            const res = await createTenant(payload)
            if (res.success && res.redirectUrl) {
                toast.success("Campus Established Successfully!", {
                    description: "Initializing your command center..."
                })
                setTimeout(() => {
                    window.location.href = res.redirectUrl
                }, 1500)
            } else {
                toast.error("Setup Failed", {
                    description: res.error || "Please try again."
                })
                setIsSubmitting(false)
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-4xl space-y-8 min-h-screen flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                    EduFlow Platinum Setup
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-mono text-emerald-500 uppercase">System Secure</p>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center justify-center space-x-4 mb-8">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#00F5FF]' : 'text-slate-600'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 1 ? 'border-[#00F5FF] bg-[#00F5FF]/10' : 'border-slate-600'}`}>1</div>
                    <span className="text-sm font-medium hidden sm:inline">Branding</span>
                </div>
                <div className="h-px w-12 bg-slate-800" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#00F5FF]' : 'text-slate-600'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 2 ? 'border-[#00F5FF] bg-[#00F5FF]/10' : 'border-slate-600'}`}>2</div>
                    <span className="text-sm font-medium hidden sm:inline">Data Import</span>
                </div>
                <div className="h-px w-12 bg-slate-800" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#00F5FF]' : 'text-slate-600'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 3 ? 'border-[#00F5FF] bg-[#00F5FF]/10' : 'border-slate-600'}`}>3</div>
                    <span className="text-sm font-medium hidden sm:inline">Launch</span>
                </div>
            </div>

            <div className="relative">
                {step === 1 && (
                    <StepBranding
                        data={data}
                        updateData={updateData}
                        onNext={handleNext}
                    />
                )}
                {step === 2 && (
                    <StepImport
                        data={data}
                        updateData={updateData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}
                {step === 3 && (
                    <StepPlan
                        data={data}
                        updateData={updateData}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
        </div>
    )
}
