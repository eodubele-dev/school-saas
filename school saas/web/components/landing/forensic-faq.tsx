"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Wifi, Banknote, ChevronDown, Check, School, Zap, Repeat, Search, LockKeyhole } from "lucide-react"
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
        id: "multi-campus",
        question: "Can I manage multiple campuses from a single login?",
        answer: "Yes. Our 'Global Command Center' allows proprietors to toggle between different campuses (e.g., Lekki, Gbagada, and Abuja) instantly. You get aggregated financial reports and individual campus performance metrics on a single dashboard, eliminating the need for separate accounts.",
        icon: <School className="w-5 h-5 text-purple-400" />
    },
    {
        id: "announcements",
        question: "Is there a limit to how many announcements we can send?",
        answer: "There's no limit, and we've optimized costs. By using 'Targeted Broadcasts', you can send messages specifically to one class or arm rather than the whole school. This typically reduces institutional SMS costs by 60% compared to traditional bulk SMS providers.",
        icon: <Zap className="w-5 h-5 text-yellow-400" />
    },
    {
        id: "leakage",
        question: "How exactly do you prevent revenue leakage?",
        answer: "Every payment is tied to a forensic reconciliation trail. If a bursar attempts to manually clear a debt without a verified bank reference, the system flags it for proprietor approval. This closed-loop system ensures that 100% of fees paid actually land in the school's bank account.",
        icon: <Search className="w-5 h-5 text-red-500" />
    },
    {
        id: "curriculum",
        question: "Does the system support both British and Nigerian curricula?",
        answer: "Yes. EduFlow allows for section-specific grading scales. You can run EYFS (Early Years) with descriptive remarks in your Nursery section, while simultaneously running a 100-point WAEC-style grading system for your Secondary section—all within the same portal.",
        icon: <Repeat className="w-5 h-5 text-indigo-400" />
    },
    {
        id: "onboarding",
        question: "How long does it take to set up?",
        answer: "We can digitize an entire school in 48 hours. Our 'Rapid-Deployment' team imports your student lists, configures your classes, and generates your first set of login credentials within 2 business days. You don't need to manually type in thousands of names.",
        icon: <Shield className="w-5 h-5 text-emerald-400" />
    },
    {
        id: "devices",
        question: "Do parents need high-end smartphones?",
        answer: "No. While we have a premium Parent App, the core communication layer works via SMS and basic email. Result links are lightweight and load instantly even on 3G networks, ensuring every parent—regardless of device—is kept in the loop.",
        icon: <Wifi className="w-5 h-5 text-orange-400" />
    },
    {
        id: "training",
        question: "Do we need to hire IT staff to manage this?",
        answer: "Absolutely not. EduFlow is designed for the 'Non-Technical' teacher. If your staff can use WhatsApp, they can use our system. We provide on-site training for your admin team and a dedicated 'Success Manager' who handles all your technical configurations remotely.",
        icon: <Check className="w-5 h-5 text-teal-400" />
    },
    {
        id: "accountability",
        question: "How do I know which staff member deleted a specific record?",
        answer: "Every action—from deleting a student profile to modifying a grade—is recorded in our 'Executive Forensic Log'. It captures the staff ID, exact timestamp, and IP address. This data is immutable, meaning not even an admin can 'wipe' their own footprints from the audit trail.",
        icon: <Search className="w-5 h-5 text-red-400" />
    },
    {
        id: "discounts",
        question: "Can scholarships or discounts be applied without my approval?",
        answer: "No. The system uses 'Multi-Level Approval Workflows'. If a bursar attempts to apply a scholarship or sibling discount, the transaction remains 'Pending' and restricted until you or an authorized director approves it via your mobile dashboard.",
        icon: <Shield className="w-5 h-5 text-blue-500" />
    },
    {
        id: "grade-integrity",
        question: "What prevents a teacher from changing a grade after publication?",
        answer: "Once the 'Term Lock' is activated, the grade book becomes read-only. Any attempt to modify a published score triggers an 'Integrity Violation' alert sent directly to your phone. Changes after publication require a digital 'Seal' only accessible to the Principal or Proprietor.",
        icon: <LockKeyhole className="w-5 h-5 text-amber-500" />
    },
    {
        id: "incidents",
        question: "Are disciplinary and medical records secure and forensic-ready?",
        answer: "Disciplinary incidents and health records are stored in a 'Vault-Class' module. These records are non-editable once saved and can include photo evidence. This ensures that in any legal or administrative dispute, the school has a verified, tamper-proof history of events.",
        icon: <Shield className="w-5 h-5 text-cyan-500" />
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
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                        Forensic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Questions.</span>
                    </h2>
                    <p className="text-muted-foreground max-w-lg mx-auto">
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
                                    borderColor: isOpen ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.05)"
                                }}
                                className={cn(
                                    "border rounded-2xl bg-black/40 backdrop-blur-sm overflow-hidden transition-all duration-300",
                                    isOpen ? "shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "hover:border-border"
                                )}
                            >
                                <button
                                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                                            isOpen ? "bg-blue-500/10" : "bg-secondary/50"
                                        )}>
                                            {faq.icon}
                                        </div>
                                        <span className="text-lg font-bold text-foreground">
                                            {faq.question}
                                        </span>
                                    </div>
                                    <ChevronDown className={cn(
                                        "w-5 h-5 text-muted-foreground transition-transform duration-300",
                                        isOpen && "rotate-180 text-blue-400"
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
                                                <p className="text-muted-foreground leading-relaxed">
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
