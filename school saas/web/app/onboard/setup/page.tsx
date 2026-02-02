'use client'

import { useState } from "react"
import { StepBranding } from "@/components/onboarding/step-branding"
import { StepAcademic } from "@/components/onboarding/step-academic"
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
        brandColor: '#2563eb',
        levels: ['nursery', 'primary', 'jss', 'sss'],
        waecStats: false,
        nerdcPresets: true,
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
            const res = await createTenant(data)
            if (res.success && res.redirectUrl) {
                toast.success("School Created Successfully!", {
                    description: "Redirecting to your new dashboard..."
                })
                // Simulate a slight delay for user to read toast
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
        <div className="w-full max-w-3xl space-y-8">
            {/* Progress Stepper */}
            <div className="flex items-center justify-center space-x-4 mb-8">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>1</div>
                    <span className="text-sm font-medium hidden sm:inline">Branding</span>
                </div>
                <div className="h-px w-8 bg-slate-300" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>2</div>
                    <span className="text-sm font-medium hidden sm:inline">Academics</span>
                </div>
                <div className="h-px w-8 bg-slate-300" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 3 ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>3</div>
                    <span className="text-sm font-medium hidden sm:inline">Plan</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
                {step === 1 && (
                    <StepBranding
                        data={data}
                        updateData={updateData}
                        onNext={handleNext}
                    />
                )}
                {step === 2 && (
                    <StepAcademic
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
