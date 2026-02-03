'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, GraduationCap, School, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SignupFormProps {
    domain: string
    schoolName?: string
    logoUrl?: string
    primaryColor?: string
    initialEmail?: string
}

export function SignupForm({ domain, schoolName, logoUrl, primaryColor = '#2563eb', initialEmail }: SignupFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Form States
    const [acceptedTerms, setAcceptedTerms] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!acceptedTerms) {
            toast.error("You must accept the Terms and Conditions to proceed.")
            return
        }

        setIsLoading(true)
        // const formData = new FormData(event.currentTarget)

        try {
            // Simulate account creation or call actual action
            await new Promise(resolve => setTimeout(resolve, 1500))

            // In a real app calls: await register(formData)

            toast.success("Account created successfully!")
            router.push('/dashboard')
            router.refresh()

        } catch (error: any) {
            console.error("Signup Error:", error)
            toast.error(error.message || "Something went wrong")
            setIsLoading(false)
        }
    }

    const brandStyle = { color: primaryColor } as React.CSSProperties
    const bgBrandStyle = { backgroundColor: primaryColor } as React.CSSProperties

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Left Side: Dark, Glowing, Brand */}
            <div className="hidden lg:flex w-[45%] bg-[#0d1117] relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ backgroundColor: primaryColor }}></div>
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob [animation-delay:2000ms]"></div>

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

                <div className="relative z-10 max-w-lg text-center">
                    <div className="flex justify-center gap-6 mb-12">
                        {logoUrl ? (
                            <div className="h-32 w-32 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-glow group hover:bg-white/10 transition-all duration-300 p-4">
                                <img src={logoUrl} alt="School Logo" className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <>
                                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-glow-purple group hover:bg-white/10 transition-all duration-300">
                                    <School className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-glow-green group hover:bg-white/10 transition-all duration-300">
                                    <GraduationCap className="h-8 w-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                                </div>
                            </>
                        )}
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                        Join {schoolName || domain}
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Create your account to access grades, attendance, and school resources.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center bg-white p-8">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <Link href="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                        </Link>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Create an account
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Enter your details below to get started.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" placeholder="John Doe" required className="bg-slate-50" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input id="email" name="email" type="email" placeholder="name@example.com" required defaultValue={initialEmail} className="bg-slate-50" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="bg-slate-50 pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                                </Button>
                            </div>
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <div className="flex items-center space-x-2 py-2">
                            <Checkbox
                                id="terms"
                                checked={acceptedTerms}
                                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                            />
                            <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600">
                                I agree to the <Link href="/terms" className="underline hover:text-slate-900">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-slate-900">Privacy Policy</Link>.
                            </Label>
                        </div>

                        <Button
                            className="w-full h-11 text-white font-medium rounded-md shadow-sm transition-all"
                            type="submit"
                            style={bgBrandStyle}
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-4">
                        Already have an account?
                        <Link href="/login" className="ml-1 font-medium hover:underline" style={brandStyle}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
