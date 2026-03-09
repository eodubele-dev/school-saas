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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function OnboardingWizard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [step, setStep] = useState(1) // 1: Account, 2: Branding, 3: Import, 4: Launch
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
    const [isTermsOpen, setIsTermsOpen] = useState(false)
    const [acceptedTerms, setAcceptedTerms] = useState(false)
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

    const handleSubmit = async (initialDeposit?: number) => {
        setIsSubmitting(true)
        try {
            const payload = {
                ...data,
                initialDeposit,
                levels: ['nursery', 'primary', 'jss', 'sss'],
                waecStats: true,
                nerdcPresets: true
            }

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

            <ProvisioningSuccess
                schoolName={data.schoolName}
                subdomain={data.subdomain}
                isVisible={showSuccess}
            />

            {/* Legal Links */}
            <div className="pt-6 pb-8 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
                <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
                    <DialogTrigger asChild>
                        <button type="button" className="hover:text-cyan-400 transition-colors">Privacy Policy</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white/[0.02] backdrop-blur-3xl border-white/10 text-slate-300 p-0 overflow-hidden flex flex-col max-h-[80vh]">
                        <DialogHeader className="p-6 border-b border-white/5 bg-black/20">
                            <DialogTitle className="text-xl text-white">Privacy Policy</DialogTitle>
                        </DialogHeader>

                        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed custom-scrollbar">
                            <p className="text-slate-400"><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>

                            <p>At EduFlow, we take the privacy and security of educational records with the utmost seriousness. This policy describes how we collect, use, and handle your school's information.</p>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold text-base">1. Information We Collect</h4>
                                <p>We collect information you provide directly to us when setting up your school (tenant data), as well as student, parent, and staff data entered by your users during normal operations. This includes personal identifiers, academic performance metrics, and financial transaction records.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold text-base">2. How We Use Your Data</h4>
                                <p>The information is used exclusively to provide, maintain, and improve the EduFlow services for your specific institution. We do not sell your data to third parties. Data is used to generate report cards, send SMS broadcasts on your behalf, and calculate financial statements.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold text-base">3. Data Protection & Security</h4>
                                <p>We implement industry-standard security measures, including AES-256 encryption at rest and TLS 1.3 in transit, to protect your school's data. Our infrastructure runs on secure, isolated cloud instances.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold text-base">4. Compliance</h4>
                                <p>Our data handling processes align with the Nigeria Data Protection Regulation (NDPR) and international equivalents like GDPR to ensure your student's records meet federal privacy standards.</p>
                            </div>
                        </div>

                        <DialogFooter className="p-4 border-t border-white/5 bg-black/40 flex-row justify-end space-x-3 items-center">
                            <Button
                                variant="ghost"
                                onClick={() => setIsPrivacyOpen(false)}
                                className="text-slate-400 hover:text-white hover:bg-white/5"
                            >
                                Decline
                            </Button>
                            <Button
                                onClick={() => {
                                    setAcceptedTerms(true)
                                    setIsPrivacyOpen(false)
                                }}
                                className="bg-[#0066FF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            >
                                {acceptedTerms ? (
                                    <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Accepted</span>
                                ) : "I Agree"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="w-1 h-1 rounded-full bg-slate-700"></div>

                <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
                    <DialogTrigger asChild>
                        <button type="button" className="hover:text-cyan-400 transition-colors">Terms of Service</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white/[0.02] backdrop-blur-3xl border-white/10 text-slate-300 p-0 overflow-hidden flex flex-col max-h-[80vh]">
                        <DialogHeader className="p-6 border-b border-white/5 bg-black/20">
                            <DialogTitle className="text-xl text-white">Terms of Service</DialogTitle>
                        </DialogHeader>

                        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed custom-scrollbar">
                            <p className="text-slate-400"><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

                            <p>Welcome to EduFlow Platinum. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold text-base">1. Account Security & Administration</h4>
                                <p>You are responsible for safeguarding the credentials used to access the service. The institution's "Proprietor" or designated Administrator is fully responsible for all activities occurring under their tenant account, including the actions of staff and students granted access.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold text-base">2. Acceptable Use</h4>
                                <p>You agree not to misuse the EduFlow platform. This includes, but is not limited to: probing security vulnerabilities, sending unsolicited commercial SMS messages through our API, or storing illicit materials. This platform is intended strictly for authorized educational and administrative purposes.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold text-base">3. Data Ownership</h4>
                                <p>Your school retains full rights to the data you upload and generate on the platform. EduFlow holds no ownership claim over your student records, financial data, or lesson plans. You may export your data at any time.</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-white font-semibold text-base">4. Service Availability</h4>
                                <p>While we strive for 99.9% uptime, we do not guarantee uninterrupted service. We perform regular maintenance windows, typically scheduled during off-peak hours (weekends/nights), and will notify administrators in advance of significant planned downtime.</p>
                            </div>
                        </div>

                        <DialogFooter className="p-4 border-t border-white/5 bg-black/40 flex-row justify-end space-x-3 items-center">
                            <Button
                                variant="ghost"
                                onClick={() => setIsTermsOpen(false)}
                                className="text-slate-400 hover:text-white hover:bg-white/5"
                            >
                                Decline
                            </Button>
                            <Button
                                onClick={() => {
                                    setAcceptedTerms(true)
                                    setIsTermsOpen(false)
                                }}
                                className="bg-[#0066FF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            >
                                {acceptedTerms ? (
                                    <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Accepted</span>
                                ) : "I Agree"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
