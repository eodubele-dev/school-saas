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
                "Attendance Registers",
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
                "Inventory Management",
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
                "Priority 24/7 Support",
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
            category: "Security & Support",
            features: [
                { name: "Role-Based Access", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Basic Audit Logs", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Forensic Fraud Detection", pilot: false, starter: false, pro: false, platinum: true },
                { name: "Customer Support", pilot: "Community", starter: "Email", pro: "Priority", platinum: "24/7 Dedicated" },
            ]
        }
    ]

    const renderValue = (val: string | boolean) => {
        if (typeof val === 'boolean') {
            return val ? <Check className="h-5 w-5 text-cyan-500 mx-auto" /> : <Minus className="h-5 w-5 text-slate-700 mx-auto" />
        }
        return <span className={`text-sm ${val.includes('AI') || val === 'Unlimited' ? 'text-cyan-400 font-medium' : 'text-slate-300'}`}>{val}</span>
    }

    return (
        <section id="pricing" className="py-24 bg-slate-950 px-6">
            <div className="max-w-[1400px] mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Transparent Pricing</h2>
                    <p className="text-slate-400">No hidden fees. Pay only for active students.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`
                                relative rounded-3xl p-8 flex flex-col h-full transition-all duration-300
                                ${plan.highlight
                                    ? 'bg-[#0B1028] border border-cyan-500/50 shadow-[0_0_40px_rgba(0,245,255,0.15)] z-10 scale-105'
                                    : 'bg-[#050B20]/50 border border-white/5 hover:border-white/10 hover:bg-[#050B20]'}
                            `}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-cyan-500/20">
                                    Best Value
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-cyan-400' : 'text-white'}`}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-sm text-slate-500">₦</span>
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                    <span className="text-sm text-slate-500">{plan.period}</span>
                                </div>
                                <p className="text-sm text-slate-400">{plan.desc}</p>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map(feat => (
                                    <div key={feat} className="flex items-start gap-3 text-sm text-slate-300">
                                        <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                                            <Check className="h-2.5 w-2.5" />
                                        </div>
                                        {feat}
                                    </div>
                                ))}
                            </div>

                            <Link href={`/onboard/setup?plan=${plan.id}`} className="w-full">
                                <Button
                                    className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${plan.highlight
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(0,245,255,0.4)]'
                                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-cyan-500/30'
                                        }`}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Comprehensive Feature Comparison Matrix */}
                <div className="mt-32 max-w-[1200px] mx-auto hidden md:block">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-white mb-4">Compare All Features</h3>
                        <p className="text-slate-400">Everything you need to run a world-class institution.</p>
                    </div>

                    <div className="bg-[#050B20]/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                        {/* Table Header */}
                        <div className="grid grid-cols-5 border-b border-white/10 bg-white/5 p-6 sticky top-0 z-20">
                            <div className="col-span-1 font-semibold text-white">Features</div>
                            <div className="text-center font-semibold text-white">Pilot</div>
                            <div className="text-center font-semibold text-white">Starter</div>
                            <div className="text-center font-semibold text-white">Professional</div>
                            <div className="text-center font-semibold text-cyan-400">Platinum</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-white/5">
                            {comparisonFeatures.map((category, idx) => (
                                <div key={idx} className="group">
                                    <div className="bg-white/5 px-6 py-4 font-semibold text-slate-200 uppercase tracking-widest text-xs">
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
