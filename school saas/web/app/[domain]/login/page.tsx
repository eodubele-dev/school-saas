'use client'

import { login, signInWithMagicLink } from '@/app/actions/auth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, BookOpen, GraduationCap, School, Wand2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function LoginPage({ params }: { params: { domain: string } }) {
    const { domain } = params
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)

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

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Left Side: Dark, Glowing, Brand */}
            <div className="hidden lg:flex w-[45%] bg-[#0d1117] relative items-center justify-center p-12 overflow-hidden">
                {/* Background Glows (Animated Blobs) */}
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob [animation-delay:2000ms]"></div>
                <div className="absolute -bottom-32 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob [animation-delay:4000ms]"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

                <div className="relative z-10 max-w-lg text-center">
                    <div className="flex justify-center gap-6 mb-12">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-glow-purple group hover:bg-white/10 transition-all duration-300">
                            <School className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-glow-green group hover:bg-white/10 transition-all duration-300">
                            <GraduationCap className="h-8 w-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-glow delay-75 group hover:bg-white/10 transition-all duration-300">
                            <BookOpen className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                        {domain.charAt(0).toUpperCase() + domain.slice(1)} Portal
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Secure access for teachers, students, and parents.
                        Manage attendance, grades, and payments in one place.
                    </p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center bg-white p-8">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Link>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Sign inside the <strong>{domain}</strong> workspace.
                        </p>
                    </div>

                    <form action={login} className="space-y-5">
                        {/* Hidden input to pass domain context */}
                        <input type="hidden" name="domain" value={domain} />

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-medium">Email address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@school_domain.com"
                                required
                                className="h-10 bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-md transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                                <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="h-10 bg-slate-50 border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-md transition-all"
                            />
                        </div>

                        <Button className="w-full h-11 bg-[#24292f] hover:bg-[#1b1f24] text-white font-medium rounded-md shadow-sm transition-all" type="submit">
                            Sign in
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium rounded-md shadow-sm transition-all"
                            variant="outline"
                            formAction={handleMagicLink}
                            disabled={isMagicLinkLoading}
                        >
                            {isMagicLinkLoading ? "Sending..." : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4 text-purple-600" />
                                    Sign in with Magic Link
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        New to {domain}?
                        <Link href={`/${domain}/signup`} className="ml-1 font-medium text-blue-600 hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
