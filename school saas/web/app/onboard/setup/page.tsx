'use client'

import { useState, useEffect } from "react"
import { StepAccount } from "@/components/onboarding/step-account"
import { StepBranding } from "@/components/onboarding/step-branding"
import { StepImport } from "@/components/onboarding/step-import"
import { StepPlan } from "@/components/onboarding/step-plan"
import { ProvisioningSuccess } from "@/components/onboarding/provisioning-success"
import { createTenant } from "@/lib/actions/onboarding"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function OnboardingWizard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [step, setStep] = useState(1) // 1: Account, 2: Branding, 3: Import, 4: Launch
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [data, setData] = useState({
        schoolName: '',
        subdomain: '',
        brandColor: '#00F5FF',
        logo: null,
        plan: '',
        fullName: '',
        email: ''
    })

    // Check for existing session on mount
    useEffect(() => {
        async function checkSession() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && step === 1) {
                setStep(2) // Skip account creation if logged in
                setData(prev => ({
                    ...prev,
                    fullName: user.user_metadata?.full_name || '',
                    email: user.email || ''
                }))
            }
        }
        checkSession()
    }, [])

    // Pre-fill from query params
    useEffect(() => {
        const schoolParam = searchParams.get('school')
        const planParam = searchParams.get('plan')

        if (schoolParam && !data.schoolName) {
            const generatedSubdomain = schoolParam.toLowerCase().replace(/[^a-z0-9]/g, '-')
            setData(prev => ({
                ...prev,
                schoolName: schoolParam,
                subdomain: generatedSubdomain,
                plan: planParam || prev.plan
            }))
        } else if (planParam) {
            setData(prev => ({ ...prev, plan: planParam }))
        }
    }, [searchParams])

    const updateData = (key: string, value: any) => {
        setData(prev => ({ ...prev, [key]: value }))
    }

    const handleNext = () => setStep(prev => prev + 1)
    const handleBack = () => setStep(prev => prev - 1)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const payload = {
                ...data,
                levels: ['nursery', 'primary', 'jss', 'sss'],
                waecStats: {},
                nerdcPresets: {}
            } as any // Temporary bypass if structure is more complex

            const res = await createTenant(payload)
            if (res.success && res.redirectUrl) {
                setShowSuccess(true)
                setTimeout(() => {
                    window.location.href = res.redirectUrl
                }, 4000)
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
        <div className="w-full max-w-4xl space-y-6">
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                    EduFlow Platinum Setup
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-mono text-emerald-500 uppercase">System Secure</p>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center justify-center space-x-4 mb-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#00F5FF]' : 'text-slate-600'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 1 ? 'border-[#00F5FF] bg-[#00F5FF]/10' : 'border-slate-600'}`}>1</div>
                    <span className="text-sm font-medium hidden sm:inline">Account</span>
                </div>
                <div className="h-px w-8 bg-slate-800" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#00F5FF]' : 'text-slate-600'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 2 ? 'border-[#00F5FF] bg-[#00F5FF]/10' : 'border-slate-600'}`}>2</div>
                    <span className="text-sm font-medium hidden sm:inline">Branding</span>
                </div>
                <div className="h-px w-8 bg-slate-800" />
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#00F5FF]' : 'text-slate-600'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 3 ? 'border-[#00F5FF] bg-[#00F5FF]/10' : 'border-slate-600'}`}>3</div>
                    <span className="text-sm font-medium hidden sm:inline">Data</span>
                </div>
                <div className="h-px w-8 bg-slate-800" />
                <div className={`flex items-center gap-2 ${step >= 4 ? 'text-[#00F5FF]' : 'text-slate-600'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 4 ? 'border-[#00F5FF] bg-[#00F5FF]/10' : 'border-slate-600'}`}>4</div>
                    <span className="text-sm font-medium hidden sm:inline">Launch</span>
                </div>
            </div>

            <div className="relative">
                {step === 1 && (
                    <StepAccount
                        data={data}
                        updateData={updateData}
                        onNext={handleNext}
                    />
                )}
                {step === 2 && (
                    <StepBranding
                        data={data}
                        updateData={updateData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}
                {step === 3 && (
                    <StepImport
                        data={data}
                        updateData={updateData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}
                {step === 4 && (
                    <StepPlan
                        data={data}
                        updateData={updateData}
                        onSubmit={handleSubmit}
                        onBack={handleBack}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>

            <ProvisioningSuccess
                schoolName={data.schoolName}
                subdomain={data.subdomain}
                isVisible={showSuccess}
            />
        </div>
    )
}
