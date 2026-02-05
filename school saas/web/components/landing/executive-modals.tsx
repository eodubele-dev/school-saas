
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Smartphone, Calendar, X } from "lucide-react"
import { useExecutiveConversion } from "./executive-context"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export function ExecutiveModals() {
    const {
        isTenantPreviewOpen,
        closeTenantPreview,
        isExecutiveDemoOpen,
        closeExecutiveDemo
    } = useExecutiveConversion()

    // --- Tenant Preview Logic ---
    const [schoolName, setSchoolName] = useState("")
    const [subdomain, setSubdomain] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (schoolName) {
            setIsTyping(true)
            const generated = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-')
            setSubdomain(generated)

            const timer = setTimeout(() => setIsTyping(false), 500)
            return () => clearTimeout(timer)
        } else {
            setSubdomain("")
        }
    }, [schoolName])

    const handleTenantSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Save to local storage or context for next step if needed
        closeTenantPreview()
        // Redirect to onboarding wizard with prefilled school name
        router.push('/onboard/setup?school=' + encodeURIComponent(schoolName))
    }

    // --- Executive Demo Logic ---
    const [auditEmail, setAuditEmail] = useState("")

    // In a real app, we might check localStorage for email from previous steps
    // useEffect(() => { ... }, [])

    return (
        <>
            {/* 1. Tenant Preview Modal (Try It Free / Start Free) */}
            <Dialog open={isTenantPreviewOpen} onOpenChange={closeTenantPreview}>
                <DialogContent className="sm:max-w-md bg-[#0A0A0B] border border-white/10 text-white p-0 overflow-hidden">
                    <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />

                    <div className="p-6 relative z-10">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                Instant Tenant Preview
                            </DialogTitle>
                            <p className="text-slate-400 text-sm">
                                Enter your school's name to see your secure workspace URL generated in real-time.
                            </p>
                        </DialogHeader>

                        <form onSubmit={handleTenantSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-cyan-500 uppercase tracking-widest">School Identity</label>
                                <div className="relative group">
                                    <Input
                                        autoFocus
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                        placeholder="e.g. Achievers Minds Academy"
                                        className={`bg-slate-900/50 border-slate-800 text-lg h-14 pl-4 transition-all duration-300 focus:ring-0 focus:ring-offset-0 ${schoolName ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'focus:border-blue-500'}`}
                                    />
                                    {/* Neon Pulse Border Effect when typing */}
                                    {isTyping && (
                                        <div className="absolute inset-0 rounded-md border-2 border-cyan-400/50 animate-pulse pointer-events-none" />
                                    )}
                                </div>
                            </div>

                            {/* Live Subdomain Preview */}
                            <AnimatePresence>
                                {subdomain && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-slate-950/50 rounded-lg p-3 border border-white/5 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <span className="text-slate-500 text-xs font-mono">https://</span>
                                            <span className="text-cyan-400 font-mono font-bold truncate">{subdomain}</span>
                                            <span className="text-slate-500 text-xs font-mono">.eduflow.ng/login</span>
                                        </div>
                                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-500 h-12 text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all group"
                                disabled={!schoolName}
                            >
                                Provision My Database
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 2. Executive Demo Modal (Platinum Closer) */}
            <Dialog open={isExecutiveDemoOpen} onOpenChange={closeExecutiveDemo}>
                <DialogContent className="sm:max-w-3xl bg-[#0f1115]/95 backdrop-blur-xl border border-white/10 text-white p-0 gap-0 overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-5 h-[600px]">
                        {/* Sidebar / Info */}
                        <div className="md:col-span-2 bg-gradient-to-b from-slate-900 to-black p-6 relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />

                            <h3 className="text-xl font-bold mb-6 mt-2">Executive Priority Access</h3>

                            <div className="space-y-6">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                                        <Smartphone className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-200">Mobile-First Walkthrough</h4>
                                        <p className="text-xs text-slate-500 mt-1">See how parents receive results on WhatsApp & SMS.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shrink-0">
                                        <Calendar className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-200">Bespoke Rollout Plan</h4>
                                        <p className="text-xs text-slate-500 mt-1">We'll map your current report card format to EduFlow live.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Badge */}
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                                        Direct Access: Lagos Executive Support Team
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Widget Area */}
                        <div className="md:col-span-3 bg-white h-full relative">
                            {/* Close Button needed because we removed default padding */}
                            <button
                                onClick={closeExecutiveDemo}
                                className="absolute top-4 right-4 z-50 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Embedded Calendar Mockup (or actual integration) */}
                            <iframe
                                src="https://calendly.com/d/cpj-q2g-37j/eduflow-executive-demo?hide_gdpr_banner=1"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title="Select a Date & Time - Calendly"
                            ></iframe>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
