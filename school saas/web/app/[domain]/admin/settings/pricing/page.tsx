"use client"

import { motion } from "framer-motion"
import { Check, Zap, Shield, Globe, Sparkles, Box, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                        <Zap className="w-3 h-3" />
                        UPGRADE_YOUR_ARSENAL
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold">
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Command Level.</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Scale your operations with forensic precision. Secure your campus, recover revenue, and automate logistics.
                    </p>
                </div>

                {/* Cards Container - Vertical on mobile, Grid on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                    {/* Tier 1: Starter */}
                    <PricingCard
                        title="Starter"
                        subtitle="The Foundation"
                        price="₦500"
                        features={[
                            "Digital Student Enrollment",
                            "Paperless Report Cards",
                            "Basic Attendance Tracking",
                            "Parent Communication App"
                        ]}
                        icon={<Box className="w-6 h-6 text-slate-400" />}
                    />

                    {/* Tier 3: Platinum (Center, Larger) */}
                    <div className="relative md:-my-8 z-10">
                        {/* Deep Blue Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

                        <PricingCard
                            title="Platinum"
                            subtitle="The Total Command"
                            price="₦1,500"
                            features={[
                                "Everything in Professional",
                                "Revenue Recovery Engine",
                                "Forensic Audit Logs",
                                "Dorm-Master Safety Link",
                                "Campus Logistics & Manifests"
                            ]}
                            isPlatinum={true}
                            icon={<Sparkles className="w-6 h-6 text-cyan-400" />}
                            roiBadge="Recovers Average of ₦9M/Term"
                        />
                    </div>

                    {/* Tier 2: Professional */}
                    <PricingCard
                        title="Professional"
                        subtitle="The Efficiency Suite"
                        price="₦850"
                        features={[
                            "Everything in Starter",
                            "EduFlow AI Remark Generator",
                            "Financial Tracking & Invoicing",
                            "Computer Based Testing (CBT)"
                        ]}
                        icon={<LayoutGrid className="w-6 h-6 text-blue-400" />}
                    />

                </div>
            </div>
        </div>
    )
}

interface PricingCardProps {
    title: string
    subtitle: string
    price: string
    features: string[]
    isPlatinum?: boolean
    icon: React.ReactNode
    roiBadge?: string
}

function PricingCard({ title, subtitle, price, features, isPlatinum = false, icon, roiBadge }: PricingCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={cn(
                "relative flex flex-col p-8 rounded-3xl border transition-all duration-300",
                isPlatinum
                    ? "bg-black/80 border-cyan-500/50 shadow-[0_0_50px_-10px_rgba(6,182,212,0.3)] md:scale-110"
                    : "bg-black/40 border-white/10 hover:border-white/20"
            )}
            style={{ backdropFilter: "blur(20px)" }}
        >
            {/* ROI Badge for Platinum */}
            {roiBadge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 whitespace-nowrap">
                    <Shield className="w-3 h-3 fill-current" />
                    {roiBadge}
                </div>
            )}

            <div className="mb-6 space-y-2">
                <div className="flex items-center justify-between">
                    <div className={cn("p-2 rounded-lg", isPlatinum ? "bg-cyan-500/10" : "bg-white/5")}>
                        {icon}
                    </div>
                    {isPlatinum && <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Recommended</div>}
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-slate-400 text-xs font-mono uppercase">{subtitle}</p>
            </div>

            <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className={cn(
                        "text-4xl font-black tracking-tight",
                        isPlatinum ? "text-glow-cyan" : "text-white"
                    )}>
                        {price}
                    </span>
                    <span className="text-slate-500 text-sm">/student/term</span>
                </div>
            </div>

            <div className="space-y-4 mb-8 flex-1">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                        <Check className={cn(
                            "w-4 h-4 mt-0.5 shrink-0",
                            isPlatinum ? "text-cyan-400" : "text-blue-500"
                        )} />
                        {feature}
                    </div>
                ))}
            </div>

            <Button
                className={cn(
                    "w-full h-12 font-bold rounded-xl transition-all",
                    isPlatinum
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                )}
            >
                {isPlatinum ? "Access Total Command" : "Get Started"}
            </Button>
        </motion.div>
    )
}
