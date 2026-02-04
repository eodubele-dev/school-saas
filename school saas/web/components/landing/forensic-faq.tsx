"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Wifi, Banknote, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
    {
        id: "offline-sync",
        question: "What happens if our school internet goes down?",
        answer: "EduFlow is built with a 'Local-First' architecture. This means your staff in Badagry or remote campuses can continue working—taking attendance, recording grades, and logging incidents—completely offline. The system automatically syncs everything to the cloud the moment connectivity is restored, ensuring zero data loss.",
        icon: <Wifi className="w-5 h-5 text-emerald-400" />
    },
    {
        id: "security",
        question: "How secure are our academic records?",
        answer: "We use Forensic Audit Logs that track every single grade change, attendance modification, and unauthorized access attempt in real-time. If a teacher alters a score after the term lock, you get an instant 'Integrity Alert'. Your data is encrypted at rest and in transit, meeting top-tier global security standards.",
        icon: <Shield className="w-5 h-5 text-blue-400" />
    },
    {
        id: "payments",
        question: "Can parents pay via local bank transfer?",
        answer: "Yes. We integrate directly with Paystack and Monnify. When a parent makes a transfer, our system automatically detects it and unlocks their child's result immediately. No manual receipt verification required. The 'Revenue Recovery' engine handles the entire reconciliation process for you.",
        icon: <Banknote className="w-5 h-5 text-cyan-400" />
    },
    {
        id: "training",
        question: "Do we need to hire IT staff to manage this?",
        answer: "Absolutely not. EduFlow is designed for the 'Non-Technical' teacher. If your staff can use WhatsApp, they can use our system. We provide on-site training for your admin team and a dedicated 'Success Manager' who handles all your technical configurations remotely.",
        icon: <Check className="w-5 h-5 text-purple-400" />
    },
    {
        id: "onboarding",
        question: "How long does it take to set up?",
        answer: "We can digitize an entire school in 48 hours. Our 'Rapid-Deployment' team imports your student lists, configures your classes, and generates your first set of login credentials within 2 business days. You don't need to manually type in thousands of names.",
        icon: <Shield className="w-5 h-5 text-yellow-400" /> /* recycling Shield or using another icon */
    },
    {
        id: "devices",
        question: "Do parents need high-end smartphones?",
        answer: "No. While we have a premium Parent App, the core communication layer works via SMS and basic email. Result links are lightweight and load instantly even on 3G networks, ensuring every parent—regardless of device—is kept in the loop.",
        icon: <Wifi className="w-5 h-5 text-red-400" /> /* Reusing Wifi contextually for connectivity */
    }
]

export function ForensicFAQ() {
    const [openId, setOpenId] = useState<string | null>("offline-sync")

    return (
        <section className="py-24 bg-[#0A0A0B] relative overflow-hidden">
            {/* Background: Blue Wave Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='30' viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 15 20, 30 10 T 60 10' fill='none' stroke='%233B82F6' stroke-width='1.5'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 30px',
                        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
                    }}
                />
            </div>

            <div className="container px-4 md:px-6 relative z-10 max-w-4xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs font-mono">
                        <Check className="w-3 h-3 text-cyan-500" />
                        SYSTEM_INTEGRITY_CHECK
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                        Forensic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Questions.</span>
                    </h2>
                    <p className="text-slate-400 max-w-lg mx-auto">
                        Specific answers for proprietors running elite institutions in Lagos, Abuja, and Port Harcourt.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq) => {
                        const isOpen = openId === faq.id
                        return (
                            <motion.div
                                key={faq.id}
                                initial={false}
                                animate={{
                                    borderColor: isOpen ? "rgba(6,182,212,0.5)" : "rgba(255,255,255,0.05)"
                                }}
                                className={cn(
                                    "border rounded-2xl bg-black/40 backdrop-blur-sm overflow-hidden transition-all duration-300",
                                    isOpen ? "shadow-[0_0_20px_rgba(6,182,212,0.1)]" : "hover:border-white/10"
                                )}
                            >
                                <button
                                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                                            isOpen ? "bg-cyan-500/10" : "bg-white/5"
                                        )}>
                                            {faq.icon}
                                        </div>
                                        <span className="text-lg font-bold text-white">
                                            {faq.question}
                                        </span>
                                    </div>
                                    <ChevronDown className={cn(
                                        "w-5 h-5 text-slate-500 transition-transform duration-300",
                                        isOpen && "rotate-180 text-cyan-400"
                                    )} />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="px-6 pb-6 pl-[4.5rem]">
                                                <p className="text-slate-400 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
