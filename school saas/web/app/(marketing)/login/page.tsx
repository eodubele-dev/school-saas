
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
        <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Decorative Background Blurs */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-white/10 dark:bg-slate-950/80 backdrop-blur-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <School className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-400">
                        {step === 'email' ? 'Find Your School' : 'Select Account'}
                    </CardTitle>
                    <CardDescription>
                        {step === 'email'
                            ? "Enter your email to locate your school dashboard."
                            : `We found ${schools.length} schools linked to your email.`
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {step === 'email' ? (
                        <form onSubmit={handleDiscovery} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@school.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
                                    disabled={loading}
                                />
                            </div>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20" type="submit" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Continue"}
                            </Button>
                        </form>
                    ) : (
                        <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {schools.map((school) => (
                                <button
                                    key={school.slug}
                                    onClick={() => redirectToSchool(school)}
                                    className="flex items-center gap-4 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all text-left group"
                                >
                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-inner overflow-hidden">
                                        {school.logo ? <img src={school.logo} alt="Logo" className="w-full h-full object-cover" /> : "🎓"}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{school.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span className="capitalize bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{school.role}</span>
                                            <span>•</span>
                                            <span>{school.slug}.eduflow.ng</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                                </button>
                            ))}

                            <Button variant="ghost" className="mt-2 text-slate-400" onClick={() => setStep('email')}>
                                Use a different email
                            </Button>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="justify-center text-sm text-slate-500">
                    <Link href="/" className="hover:text-emerald-500 transition-colors flex items-center gap-2">
                        ← Back to Home
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
