'use client'

import Link from "next/link"
import { Check, Minus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function PricingTable() {
    const [locationState, setLocationState] = useState('Lagos')

    useEffect(() => {
        fetch('https://get.geojs.io/v1/ip/geo.json')
            .then(res => res.json())
            .then(data => {
                if (data.region) {
                    const stateName = data.region
                        .replace(' State', '')
                        .replace(' Federal Capital Territory', 'Abuja')
                        .trim()
                    if (stateName) setLocationState(stateName)
                }
            })
            .catch((err) => {
                console.warn('Could not detect location, defaulting to Lagos', err)
            })
    }, [])

    const plans = [
        {
            name: `${locationState} Pilot`,
            id: "pilot",
            price: "0",
            period: "/ Term 1",
            desc: `Free entry for ${locationState} Schools. Prove value early.`,
            features: [
                "Up to 100 Students",
                "Core Gradebook",
                "Basic Dashboards",
                "System Audit Logs",
                "Min. ₦10k SMS Wallet"
            ],
            cta: "Start Free Pilot",
            highlight: false
        },
        {
            name: "Starter",
            id: "starter",
            price: "20,000",
            period: "/ term",
            desc: "Essential tools for small schools.",
            features: [
                "Up to 300 Students",
                "Automated Report Cards",
                "Parent Portal Access",
                "Basic Fee Tracking",
                "Global Debt Alert System",
                "Basic Email Broadcasts"
            ],
            cta: "Get Started",
            highlight: false
        },
        {
            name: "Professional",
            id: "professional",
            price: "50,000",
            period: "/ term",
            desc: "Advanced features for growing schools.",
            features: [
                "Unlimited Students",
                "Complete Finance & Bursary",
                "CBT & Online Exams",
                "Advanced SMS Communications",
                "Global Debt Alert System",
                "Staff Payroll Module"
            ],
            cta: "Get Professional",
            highlight: false
        },
        {
            name: "Platinum",
            id: "platinum",
            price: "150,000",
            period: "/ term",
            desc: "AI-Powered suite for elite institutions.",
            features: [
                "Everything in Professional",
                "Gemini AI Lesson Planner",
                "AI Behavioral Remarks",
                "Proprietor 'God-Mode' App",
                "Global Debt Alert System",
                "Forensic Fraud & Audit Logs"
            ],
            cta: "Start Setup",
            highlight: true
        }
    ]

    const comparisonFeatures = [
        {
            category: "Core Academics & Records",
            features: [
                { name: "Student Capacity", pilot: "100", starter: "300", pro: "Unlimited", platinum: "Unlimited" },
                { name: "Digital Gradebook", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Attendance Tracking", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Automated Report Cards", pilot: false, starter: true, pro: true, platinum: true },
                { name: "CBT & Online Exams", pilot: false, starter: false, pro: true, platinum: true },
                { name: "Lesson Plan Generation", pilot: false, starter: false, pro: false, platinum: "AI-Assisted" },
                { name: "Behavioral Remarks", pilot: false, starter: false, pro: "Manual", platinum: "AI-Generated" },
            ]
        },
        {
            category: "Finance & Admin",
            features: [
                { name: "Basic Fee Tracking", pilot: false, starter: true, pro: true, platinum: true },
                { name: "Invoicing & Receipts", pilot: false, starter: false, pro: true, platinum: true },
                { name: "Staff Payroll", pilot: false, starter: false, pro: true, platinum: true },
                { name: "Inventory Management", pilot: false, starter: false, pro: true, platinum: true },
            ]
        },
        {
            category: "Communication & Portals",
            features: [
                { name: "SMS Broadcasts", pilot: "Wallet Required", starter: "Wallet Required", pro: "Advanced", platinum: "Premium" },
                { name: "Email Broadcasts", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Parent Portal", pilot: false, starter: true, pro: true, platinum: true },
                { name: "Teacher Dashboard", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Proprietor Mobile App", pilot: false, starter: false, pro: false, platinum: true },
            ]
        },
        {
            category: "Network & Security",
            features: [
                { name: "Global Debt Alert System", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Role-Based Access", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Basic Audit Logs", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Forensic Fraud Detection", pilot: false, starter: false, pro: false, platinum: true },
                { name: "Customer Support", pilot: "Community", starter: "Email", pro: "Priority", platinum: "24/7 Dedicated" },
            ]
        }
    ]

    const renderValue = (val: string | boolean) => {
        if (typeof val === 'boolean') {
            return val ? <Check className="h-5 w-5 text-blue-500 mx-auto" /> : <Minus className="h-5 w-5 text-slate-700 mx-auto" />
        }
        return <span className={`text-sm ${val.includes('AI') || val === 'Unlimited' ? 'text-blue-400 font-medium' : 'text-slate-300'}`}>{val}</span>
    }

    return (
        <section id="pricing" className="py-24 bg-slate-950 px-6">
            <div className="max-w-[1400px] mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Transparent Pricing</h2>
                    <p className="text-muted-foreground">No hidden fees. Pay only for active students.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {plans.map((plan, i) => {
                        const isPopular = plan.highlight;

                        return (
                            <div
                                key={i}
                                className={`
                                    relative flex flex-col p-6 md:p-8 rounded-2xl border transition-all duration-200
                                    ${isPopular ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-blue-500' : 'border-border bg-card text-card-foreground/40 hover:border-blue-500/50 hover:bg-card text-card-foreground/50'}
                                    h-full
                                `}
                            >
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-foreground text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                                        Recommended
                                    </div>
                                )}

                                <div className="mb-6 flex-1">
                                    <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-sm text-muted-foreground font-medium">₦</span>
                                        <span className="text-4xl font-bold text-foreground tracking-tight">{plan.price}</span>
                                        <span className="text-sm text-muted-foreground font-medium">{plan.period}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                                        {plan.desc}
                                    </p>
                                </div>

                                <ul className="space-y-4 mb-8 mt-auto">
                                    {plan.features.map((feat, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-300">
                                            <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <Check className="h-3 w-3 text-blue-400" />
                                            </div>
                                            <span className="leading-snug">{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto">
                                    <Link href={`/onboard/setup?plan=${plan.id}`} className="w-full block">
                                        <Button
                                            className={`w-full h-12 text-sm font-semibold rounded-lg transition-colors ${isPopular
                                                ? 'bg-blue-600 hover:bg-blue-700 text-foreground shadow-md'
                                                : 'bg-slate-800 hover:bg-slate-700 text-foreground'
                                                }`}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Comprehensive Feature Comparison Matrix */}
                <div className="mt-32 max-w-[1200px] mx-auto hidden md:block">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-foreground mb-4">Compare All Features</h3>
                        <p className="text-muted-foreground">Everything you need to run a world-class institution.</p>
                    </div>

                    <div className="bg-[#050B20]/50 border border-border/50 rounded-3xl overflow-hidden backdrop-blur-sm">
                        {/* Table Header */}
                        <div className="grid grid-cols-5 border-b border-border bg-secondary/50 p-6 sticky top-0 z-20">
                            <div className="col-span-1 font-semibold text-foreground">Features</div>
                            <div className="text-center font-semibold text-foreground">Pilot</div>
                            <div className="text-center font-semibold text-foreground">Starter</div>
                            <div className="text-center font-semibold text-foreground">Professional</div>
                            <div className="text-center font-semibold text-blue-400">Platinum</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-white/5">
                            {comparisonFeatures.map((category, idx) => (
                                <div key={idx} className="group">
                                    <div className="bg-secondary/50 px-6 py-4 font-semibold text-slate-200 uppercase tracking-widest text-xs">
                                        {category.category}
                                    </div>
                                    <div className="divide-y divide-white/[0.02]">
                                        {category.features.map((feature, fIdx) => (
                                            <div key={fIdx} className="grid grid-cols-5 p-6 hover:bg-white/[0.02] transition-colors">
                                                <div className="col-span-1 text-sm text-slate-300 flex items-center pr-4">
                                                    {feature.name}
                                                </div>
                                                <div className="text-center flex items-center justify-center">
                                                    {renderValue(feature.pilot)}
                                                </div>
                                                <div className="text-center flex items-center justify-center">
                                                    {renderValue(feature.starter)}
                                                </div>
                                                <div className="text-center flex items-center justify-center">
                                                    {renderValue(feature.pro)}
                                                </div>
                                                <div className="text-center flex items-center justify-center">
                                                    {renderValue(feature.platinum)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
