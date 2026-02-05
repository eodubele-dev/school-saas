
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { findSchoolsByEmail, SchoolDiscoveryResult } from "@/lib/actions/auth-discovery"
import { Loader2, School, ArrowRight, UserCircle } from "lucide-react"
import { toast } from "sonner"

export default function MarketingLoginPage() {
    const [step, setStep] = useState<'email' | 'selection'>('email')
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [schools, setSchools] = useState<SchoolDiscoveryResult[]>([])

    const handleDiscovery = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        try {
            const res = await findSchoolsByEmail(email)
            if (res.success) {
                if (res.schools && res.schools.length > 0) {
                    // 1. Found Schools
                    setSchools(res.schools)
                    setStep('selection')

                    // Auto-redirect if only one school
                    if (res.schools.length === 1) {
                        redirectToSchool(res.schools[0])
                    }
                } else {
                    // 2. No Schools Found
                    toast.error("No account found with this email.")
                }
            } else {
                toast.error(res.error)
            }
        } catch (err) {
            toast.error("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    const redirectToSchool = (school: SchoolDiscoveryResult) => {
        // Construct URL based on environment (handling localhost vs production)
        const protocol = window.location.protocol
        const host = window.location.host
        const rootDomain = host.replace('www.', '') // naive, but works for simple cases

        // If we are on localhost:3000, new url is [slug].localhost:3000
        // If on eduflow.ng, new url is [slug].eduflow.ng
        // Note: host includes port on localhost

        let newHost = ''
        if (host.includes('localhost')) {
            newHost = `${school.slug}.localhost:3000` // Hardcoding port 3000 for local dev assumption
            if (host.includes(':')) {
                const port = host.split(':')[1]
                newHost = `${school.slug}.localhost:${port}`
            }
        } else {
            newHost = `${school.slug}.${rootDomain}`
        }

        const targetUrl = `${protocol}//${newHost}/login?email=${encodeURIComponent(email)}`
        window.location.href = targetUrl
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0B] px-4 relative overflow-hidden font-sans selection:bg-cyan-900 selection:text-white">
            {/* 1. The Security Gate UI: Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Radial Blue Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* The Card Wrapper for Gradient Border */}
            <div className="relative z-10 w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-b from-cyan-500/30 to-transparent shadow-2xl">
                <Card className="w-full bg-black/60 backdrop-blur-xl border-none rounded-2xl text-white">
                    <CardHeader className="text-center pt-8 pb-2">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/20 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                            <School className="h-8 w-8 text-cyan-400" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight text-white">
                            {step === 'email' ? 'Secure Login' : 'Select Account'}
                        </CardTitle>
                        <CardDescription className="text-slate-500 mt-2 text-base">
                            {step === 'email'
                                ? "Enter your credentials to access the command center."
                                : `Identity confirmed. ${schools.length} portal(s) found.`
                            }
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-8 px-8">
                        {step === 'email' ? (
                            <form onSubmit={handleDiscovery} className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-xs font-mono uppercase tracking-widest text-slate-500 ml-1">Official Email</Label>
                                    <div className="relative group">
                                        <UserCircle className="absolute left-3 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="principal@school.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-12 bg-[#050505] border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-all rounded-lg"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Enter Command Center"}
                                </Button>
                            </form>
                        ) : (
                            <div className="grid gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                                {schools.map((school) => (
                                    <button
                                        key={school.slug}
                                        onClick={() => redirectToSchool(school)}
                                        className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all text-left group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        <div className="h-12 w-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-xl overflow-hidden shrink-0 relative z-10">
                                            {school.logo ? <img src={school.logo} alt="Logo" className="w-full h-full object-cover" /> : "🎓"}
                                        </div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{school.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                <span className="bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 text-[10px] uppercase font-bold tracking-wider">{school.role}</span>
                                                <span className="truncate max-w-[120px]">{school.slug}.eduflow.ng</span>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1 relative z-10" />
                                    </button>
                                ))}

                                <Button variant="ghost" className="mt-4 text-slate-500 hover:text-white" onClick={() => setStep('email')}>
                                    ← Use a different email
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex-col gap-6 pb-8">
                        <div className="flex w-full justify-between items-center px-4">
                            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-white transition-colors opacity-40 hover:opacity-100">
                                Back to Home
                            </Link>
                            <button onClick={() => toast.info("Email Support: support@eduflow.ng", { description: "Our team typically responds within 15 minutes." })} className="text-sm font-medium text-slate-500 hover:text-white transition-colors opacity-40 hover:opacity-100">
                                Technical Support
                            </button>
                        </div>

                        {/* 4. Visual Flourish */}
                        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-900 uppercase tracking-widest bg-cyan-950/20 px-3 py-1 rounded-full border border-cyan-900/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            SSL_ENCRYPTED // AUDIT_LOG_ACTIVE
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
