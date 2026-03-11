'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Mail, Lock, Loader2, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface StepAccountProps {
    data: any
    updateData: (key: string, value: any) => void
    onNext: () => void
    acceptedTerms: boolean
    setAcceptedTerms: (val: boolean) => void
}

export function StepAccount({ data, updateData, onNext, acceptedTerms, setAcceptedTerms }: StepAccountProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [mode, setMode] = useState<'signup' | 'login'>('signup')
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const cleanEmail = data.email?.trim()
        const cleanFullName = data.fullName?.trim()

        try {
            if (mode === 'signup') {
                const { data: authData, error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password: password,
                    options: {
                        data: {
                            full_name: cleanFullName,
                        },
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                })
                if (error) throw error
                if (authData.user) {
                    // Check if a session was established (i.e. email confirmation not required or auto-confirmed)
                    if (authData.session) {
                        toast.success("Identity Established", {
                            description: "Your administrator account has been created."
                        })
                        router.refresh()
                        setTimeout(onNext, 500)
                    } else {
                        // Email confirmation is required
                        toast.info("Verification Required", {
                            description: "Please check your email to verify your account before continuing."
                        })
                        // Don't call onNext() yet.
                    }
                }
            } else {
                const { data: authData, error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password: password,
                })
                if (error) throw error
                if (authData.user && authData.session) {
                    toast.success("Welcome Back", {
                        description: "Authenticated successfully."
                    })
                    updateData('fullName', authData.user.user_metadata?.full_name || '')
                    router.refresh()
                    setTimeout(onNext, 500)
                } else if (!authData.session) {
                    toast.error("Login Failed", {
                        description: "Could not establish a secure session. Please check your credentials or verify your email."
                    })
                }
            }
        } catch (error: any) {
            let errorMessage = error.message
            if (errorMessage.includes("rate limit exceeded")) {
                errorMessage = "Rate limit exceeded. Please wait a minute before trying again, or try logging in if you already created an account."
            }
            toast.error(mode === 'signup' ? "Registration Failed" : "Login Failed", {
                description: errorMessage
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 bg-white/[0.03] backdrop-blur-md p-8 rounded-3xl border border-border shadow-2xl">
            <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    {mode === 'signup' ? 'Proprietor Identity' : 'Welcome Back'}
                </h2>
                <p className="text-gray-400">
                    {mode === 'signup'
                        ? 'Establish your secure credentials for the command center.'
                        : 'Sign in to your account to continue the setup.'
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                    <div className="grid gap-2">
                        <Label className="text-muted-foreground ml-1 text-xs uppercase font-mono tracking-widest">Full Name</Label>
                        <div className="relative group">
                            <User className="absolute left-3 top-3 h-5 w-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                            <Input
                                placeholder="e.g. Dr. Adesina Johnson"
                                value={data.fullName || ''}
                                onChange={(e) => updateData('fullName', e.target.value)}
                                required
                                className="bg-secondary/50 border-border text-foreground pl-10 h-11 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                            />
                        </div>
                    </div>
                )}

                <div className="grid gap-2">
                    <Label className="text-muted-foreground ml-1 text-xs uppercase font-mono tracking-widest">Official Email</Label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                        <Input
                            type="email"
                            placeholder="principal@yourschool.com"
                            value={data.email || ''}
                            onChange={(e) => updateData('email', e.target.value.trim())}
                            required
                            className="bg-secondary/50 border-border text-foreground pl-10 h-11 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label className="text-muted-foreground ml-1 text-xs uppercase font-mono tracking-widest">Secure Password</Label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-secondary/50 border-border text-foreground pl-10 pr-10 h-11 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-cyan-400 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {mode === 'signup' && (
                    <div className="flex items-start space-x-3 pt-2">
                        <Checkbox
                            id="terms"
                            checked={acceptedTerms}
                            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                            className="mt-1 border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-black"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium text-slate-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                Accept terms and conditions
                            </label>
                            <p className="text-xs text-muted-foreground">
                                You agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading || (mode === 'signup' && !acceptedTerms)}
                        className="w-full bg-[#0066FF] hover:bg-blue-600 h-12 text-foreground font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                {mode === 'signup' ? 'Authenticate & Proceed' : 'Secure Login'}
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <div className="text-center">
                <p className="text-xs text-muted-foreground">
                    {mode === 'signup' ? (
                        <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-cyan-400 hover:underline">Log in</button></>
                    ) : (
                        <>Need a new account? <button type="button" onClick={() => setMode('signup')} className="text-cyan-400 hover:underline">Sign up</button></>
                    )}
                </p>
            </div>
        </div>
    )
}
