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

import { Button } from "@/components/ui/button"
import { Check, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function OnboardingWizard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [step, setStep] = useState(1) // 1: Account, 2: Branding, 3: Import, 4: Launch
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRecovering, setIsRecovering] = useState(true)
    const [showSuccess, setShowSuccess] = useState(false)

    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [data, setData] = useState({
        schoolName: '',
        subdomain: '',
        brandColor: '#0066FF',
        logoUrl: null,
        plan: 'pilot',
        fullName: '',
        email: ''
    })

    // Check for existing session and localStorage on mount
    useEffect(() => {
        async function initializeOnboarding() {
            // 1. Recover from localStorage first
            const savedState = localStorage.getItem('eduflow_onboarding_state')
            let recoveredData = {}
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState)
                    recoveredData = parsed
                    setData(prev => ({ ...prev, ...parsed }))
                    if (parsed.step) setStep(parsed.step)
                } catch (e) {
                    console.error("Failed to parse saved onboarding state", e)
                }
            }

            // 2. Refresh session
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                setData(prev => ({
                    ...prev,
                    fullName: prev.fullName || user.user_metadata?.full_name || '',
                    email: prev.email || user.email || ''
                }))
                
                // Only skip to Step 2 if we are still on Step 1
                if (step === 1 && !(recoveredData as any).step) {
                    setStep(2)
                }
            }
            
            setIsRecovering(false)
        }
        initializeOnboarding()
    }, [])

    // Save to localStorage whenever data or step changes (only after recovery)
    useEffect(() => {
        if (!isRecovering) {
            localStorage.setItem('eduflow_onboarding_state', JSON.stringify({
                ...data,
                step
            }))
        }
    }, [data, step, isRecovering])

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

    const handleSubmit = async (initialDeposit?: number, transactionReference?: string) => {
        setIsSubmitting(true)
        try {
            const payload = {
                ...data,
                initialDeposit,
                transactionReference,
                levels: ['nursery', 'primary', 'jss', 'sss'],
                waecStats: true,
                nerdcPresets: true
            }

            const res = await createTenant({ ...payload, logoUrl: data.logoUrl || undefined } as any)
            
            if (!res) {
                throw new Error("No response from server. This may be due to a timeout or configuration error.")
            }

            if (res.success && res.redirectUrl) {
                localStorage.removeItem('eduflow_onboarding_state') // Clear on success
                setShowSuccess(true)
                setTimeout(() => {
                    window.location.href = res.redirectUrl
                }, 4000)
            } else {
                toast.error("Setup Failed", {
                    description: (res as any).error || "Please try again."
                })
                setIsSubmitting(false)
            }
        } catch (error: any) {
            console.error("Setup Submission Error:", error)
            toast.error("Process Interrupted", {
                description: error.message || "The server encountered a critical error. Please check your network or try again."
            })
            setIsSubmitting(false)
        }
    }
    const stepConfig = [
        { id: 1, label: 'Account', title: 'Proprietor Identity', description: 'Establish your secure administrative credentials to access the command center.' },
        { id: 2, label: 'Branding', title: 'Visual Identity', description: 'Upload your crest and define your custom colors for a personalized portal.' },
        { id: 3, label: 'Data', title: 'Campus Data', description: 'Setup your standard subjects and configure optional modules.' },
        { id: 4, label: 'Launch', title: 'Finalization', description: 'Initialize your database and activate the live environment.' }
    ]

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col pt-6 lg:pt-12 min-h-max pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 animate-in fade-in duration-700">
                {/* Left Column: Progress & Guidance (Sticky Sidebar Wrapper) */}
                <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32 space-y-10">
                {/* Branding/Title */}
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 mb-3">
                        EduFlow Setup
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-[pulse_2s_ease-in-out_infinite]" />
                        <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full inline-block">
                            Secure Initialization
                        </p>
                    </div>
                    <p className="text-slate-400 mt-4 text-sm leading-relaxed">
                        Follow the checklist below to provision an isolated, high-performance database instance for your institution.
                    </p>
                </div>

                {/* Vertical Stepper */}
                <div className="space-y-6 relative">
                    {stepConfig.map((s, index) => {
                        const isCompleted = step > s.id;
                        const isCurrent = step === s.id;
                        const isUpcoming = step < s.id;

                        return (
                            <div key={s.id} className="relative flex items-start gap-4 z-10 group">
                                {/* Indicator */}
                                <div className={`
                                    flex items-center justify-center w-9 h-9 rounded-full border-2 shrink-0 transition-all duration-500 backdrop-blur-sm
                                    ${isCompleted ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-[0_0_15px_rgba(0,102,255,0.4)]' : ''}
                                    ${isCurrent ? 'bg-transparent border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : ''}
                                    ${isUpcoming ? 'bg-transparent border-white/10 text-slate-600' : ''}
                                `}>
                                    {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold font-mono">{s.id}</span>}
                                </div>
                                
                                {/* Content */}
                                <div className={`
                                    pt-1 flex flex-col transition-all duration-300
                                    ${isCurrent ? 'opacity-100 translate-x-1' : 'opacity-50 hover:opacity-75'}
                                `}>
                                    <span className={`text-xs font-mono font-bold tracking-wider uppercase mb-1 ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`}>
                                        {s.label}
                                    </span>
                                    <h3 className={`text-base font-semibold mb-1 ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                                        {s.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-snug">
                                        {s.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                </div>
            </div>

            {/* Right Column: Interactive Forms */}
            <div className="lg:col-span-8">
                <div className="space-y-6 min-h-[500px]">
                    {step === 1 && (
                        <StepAccount
                            data={data}
                            updateData={updateData}
                            onNext={handleNext}
                            acceptedTerms={acceptedTerms}
                            setAcceptedTerms={setAcceptedTerms}
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
            </div>
            </div>



            <ProvisioningSuccess
                schoolName={data.schoolName}
                subdomain={data.subdomain}
                isVisible={showSuccess}
            />
        </div>
    )
}
