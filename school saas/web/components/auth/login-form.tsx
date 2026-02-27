'use client'

import { login, signInWithMagicLink } from '@/app/actions/auth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen, GraduationCap, School, Wand2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'

interface LoginFormProps {
    domain: string
    schoolName?: string
    logoUrl?: string
    primaryColor?: string
    initialEmail?: string
}

export function LoginForm({ domain, schoolName, logoUrl, primaryColor = '#2563eb', initialEmail }: LoginFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)

        try {
            toast.info("Signing in...")
            const result = await login(formData)

            if (result?.error) {
                toast.error(result.error)
                setIsLoading(false)
                return
            }

            // Success
            toast.success("Login successful!")
            router.push('/dashboard')
            router.refresh()

        } catch (error: any) {
            console.error("Login Client Error:", error)
            toast.error(error.message || "Something went wrong")
            setIsLoading(false)
        }
    }

    async function handleMagicLink(formData: FormData) {
        setIsMagicLinkLoading(true)
        const email = formData.get('email')

        if (!email) {
            toast.error("Please enter your email address first.")
            setIsMagicLinkLoading(false)
            return
        }

        const result = await signInWithMagicLink(formData)
        setIsMagicLinkLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Magic link sent! Check your inbox.")
        }
    }

    // Dynamic style for primary color
    // Dynamic style for primary color can be used for glows
    const primaryGlow = primaryColor || '#00F5FF'

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0B] px-4 relative overflow-hidden font-sans selection:bg-cyan-900 selection:text-white">
            {/* 1. Background Grid */}
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Radial Glow (Customizable by School Color) */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none opacity-20"
                style={{ backgroundColor: primaryGlow }}
            />

            {/* The Card Wrapper */}
            <div className="relative z-10 w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent shadow-2xl">
                <div className="w-full bg-black/60 backdrop-blur-xl border-none rounded-2xl text-white p-8">
                    {/* Header: School Logo & Name */}
                    <div className="text-center mb-8">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden p-2">
                            {logoUrl ? (
                                <img src={logoUrl} alt={schoolName} className="w-full h-full object-contain" />
                            ) : (
                                <img
                                    src="/visuals/auth-logo.png"
                                    alt="Identiy Verified"
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                            {schoolName || domain}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Command Center Access
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="domain" value={domain} />

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">Official Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={initialEmail}
                                    className="h-11 bg-[#050505] border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 rounded-lg transition-all"
                                    readOnly={!!initialEmail} // If coming from finding flow, arguably read-only or editable? Let's leave editable but styled.
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                                    <Link href="/forgot-password" className="text-xs text-cyan-500 hover:text-cyan-400">
                                        Recover Key?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="h-11 bg-[#050505] border-white/10 text-white focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 rounded-lg transition-all pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-0 top-0 h-full px-3 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300"
                            type="submit"
                            disabled={isLoading || isMagicLinkLoading}
                        >
                            {isLoading ? "Verifying Credentials..." : "Authenticate"}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase">
                                <span className="bg-[#0A0A0B] px-2 text-slate-600">Alternative Access</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium rounded-lg transition-all"
                            variant="outline"
                            formAction={handleMagicLink}
                            disabled={isMagicLinkLoading}
                        >
                            {isMagicLinkLoading ? "Sending Link..." : (
                                <span className="flex items-center gap-2">
                                    <Wand2 className="h-4 w-4 text-purple-400" />
                                    Sign in with Magic Link
                                </span>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-slate-600 mt-8">
                        Authorized Personnel Only • <Link href="/" className="hover:text-slate-400 transition-colors">Abort Session</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
