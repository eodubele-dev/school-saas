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
                { name: "Student Capacity", hint: "The maximum number of active student profiles your institution can manage simultaneously within the specific tier.", pilot: "100", starter: "300", pro: "Unlimited", platinum: "Unlimited" },
                { name: "Digital Gradebook", hint: "A centralized, error-free portal for teachers to input, calculate, and manage continuous assessments and exam scores.", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Attendance Tracking", hint: "Advanced systems to monitor daily student punctuality, synchronized instantly with parent portals.", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Automated Report Cards", hint: "Generate and instantly dispatch professionally designed end-of-term academic reports directly to parents' phones.", pilot: false, starter: true, pro: true, platinum: true },
                { name: "CBT & Online Exams", hint: "A powerful computer-based testing engine customized for your school's mid-terms and mock examinations.", pilot: false, starter: false, pro: true, platinum: true },
                { name: "Lesson Plan Generation", hint: "Leverage Google Gemini AI to automatically generate curriculum-aligned, engaging lesson plans for any subject in seconds.", pilot: false, starter: false, pro: false, platinum: "AI-Assisted" },
                { name: "Behavioral Remarks", hint: "Deploy intelligent algorithms to analyze a student's performance and generate personalized, constructive end-of-term teacher remarks.", pilot: false, starter: false, pro: "Manual", platinum: "AI-Generated" },
            ]
        },
        {
            category: "Finance & Admin",
            features: [
                { name: "Basic Fee Tracking", hint: "Monitor termly school fees, log part-payments, and view outstanding balances across all classes.", pilot: false, starter: true, pro: true, platinum: true },
                { name: "Invoicing & Receipts", hint: "Automatically generate professional, branded digital receipts and invoices for parents via email or SMS.", pilot: false, starter: false, pro: true, platinum: true },
                { name: "Staff Payroll", hint: "Manage staff salaries, deductions, tax compliance, and multi-tier payment structures seamlessly.", pilot: false, starter: false, pro: true, platinum: true },
                { name: "Inventory Management", hint: "Track textbooks, uniforms, and school assets to prevent leakages and optimize institutional stock.", pilot: false, starter: false, pro: true, platinum: true },
            ]
        },
        {
            category: "Communication & Portals",
            features: [
                { name: "SMS Broadcasts", hint: "Send high-priority institutional alerts, specific class notifications, and emergency broadcasts instantly to parents' cell numbers.", pilot: "Wallet Required", starter: "Wallet Required", pro: "Advanced", platinum: "Premium" },
                { name: "Email Broadcasts", hint: "Dispatch detailed newsletters, circulars, and official school communications with modern digital branding.", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Parent Portal", hint: "A dedicated, secure dashboard where parents can view their wards' attendance, fees, and real-time academic progress.", pilot: false, starter: true, pro: true, platinum: true },
                { name: "Teacher Dashboard", hint: "A focused interface for educators to manage their assigned classes, upload scores, and communicate with students.", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Proprietor Mobile App", hint: "A specialized app giving school owners a God's-eye view of aggregate cash flow, attendance, and overall school metrics on the go.", pilot: false, starter: false, pro: false, platinum: true },
            ]
        },
        {
            category: "Institutional Security & Desktop Native",
            features: [
                { name: "Executive Offline Vault (SQLite)", hint: "Continue logging attendance and finance data even when the school's internet drops. Auto-syncs to the cloud securely when back online.", pilot: false, starter: false, pro: false, platinum: "Auto-Sync" },
                { name: "Biometric Bank-Grade Security", hint: "Hardware-level Windows Hello facial and fingerprint locks for highly sensitive financial and administrative dashboards.", pilot: false, starter: false, pro: false, platinum: true },
                { name: "Secure Kiosk Mode (Hardware Lockdown)", hint: "Locks the workstation to prevent students from opening other tabs during CBT exams, or receptionists from browsing unauthorized sites.", pilot: false, starter: false, pro: false, platinum: true },
                { name: "Native OS Pulse Notifications", hint: "Real-time, persistent Windows OS alerts for critical debt payments or security breaches, even when the app is minimized.", pilot: false, starter: false, pro: false, platinum: true },
                { name: "Empire Management (Multi-School Sync)", hint: "Synchronize all your schools into native workstation tabs with instant switching for proprietors managing multiple institutions.", pilot: false, starter: false, pro: false, platinum: true },
            ]
        },
        {
            category: "Network & Alerts",
            features: [
                { name: "Global Debt Alert System", hint: "Our proprietary network flags evasive parents attempting to register at your school if they owe fees at another EduFlow-partnered institution.", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Role-Based Access", hint: "Enforce strict security by assigning tailored access permissions to teachers, bursars, drivers, and admins.", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Basic Audit Logs", hint: "A chronological ledger tracking who did what and when, ensuring baseline accountability for staff actions.", pilot: true, starter: true, pro: true, platinum: true },
                { name: "Forensic Fraud Detection", hint: "Advanced anomaly-detection engine to catch unauthorized grade tampering, fee manipulation, or financial ghost-entries.", pilot: false, starter: false, pro: false, platinum: true },
                { name: "Customer Support", hint: "Access tailored technical assistance to resolve onboarding, operational, or feature-related inquiries.", pilot: "Community", starter: "Email", pro: "Priority", platinum: "24/7 Dedicated" },
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

                    <div className="bg-[#050B20]/50 border border-border/50 rounded-3xl backdrop-blur-sm relative overflow-visible">
                        {/* Table Header */}
                        <div 
                            className="grid grid-cols-5 border-b border-white/10 bg-slate-900/95 p-6 z-40 rounded-t-3xl backdrop-blur-md shadow-xl"
                            style={{ position: 'sticky', top: '80px', zIndex: 40 }}
                        >
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
                                                <div className="col-span-1 text-sm text-slate-300 flex items-center pr-4 relative group/hint">
                                                    <span>{feature.name}</span>
                                                    {(feature as any).hint && (
                                                        <>
                                                            <Info className="h-4 w-4 ml-2 text-slate-500 group-hover/hint:text-blue-400 cursor-help transition-colors shrink-0" />
                                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/hint:block w-[280px] p-3 bg-slate-900 text-slate-200 text-xs leading-relaxed rounded-lg shadow-2xl border border-slate-700 z-50 pointer-events-none">
                                                                {(feature as any).hint}
                                                                <div className="absolute left-4 top-full border-[6px] border-transparent border-t-slate-700"></div>
                                                                <div className="absolute left-[17px] top-full border-[5px] border-transparent border-t-slate-900"></div>
                                                            </div>
                                                        </>
                                                    )}
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
