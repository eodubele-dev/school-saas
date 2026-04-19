import Link from "next/link"
import { ArrowLeft, Shield, Lock, Eye, FileText, Database, UserCheck, HelpCircle } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants/site-config"

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-black text-slate-200 py-24 px-4 md:px-8 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
            <div className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }} />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-400 mb-12 transition-all hover:-translate-x-1 group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
                </Link>

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
                        <p className="text-blue-400 font-mono text-xs mt-1 uppercase tracking-widest">NDPR-2019 & NDPA-2023 COMPLIANT</p>
                    </div>
                </div>

                <div className="space-y-12 mt-16">
                    {/* Intro Card */}
                    <div className="bg-[#252936]/80 backdrop-blur-md border border-white/10 p-8 rounded-[32px] shadow-2xl">
                        <p className="text-sm text-slate-500 italic mb-8 border-l-2 border-blue-500 pl-4 font-mono">Effective Date: April 19, 2026</p>
                        
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg leading-relaxed text-slate-300">
                                This Privacy Policy describes how <span className="text-white font-bold">{SITE_CONFIG.name}</span> (&quot;we&quot;, &quot;us&quot;, or &quot;the Platform&quot;) collects, uses, and protects data in strict compliance with the <span className="text-blue-400 underline underline-offset-4 decoration-blue-500/30">Nigeria Data Protection Regulation (NDPR) 2019</span> and the <span className="text-blue-400 underline underline-offset-4 decoration-blue-500/30">Nigeria Data Protection Act (NDPA) 2023</span>.
                            </p>
                        </div>
                    </div>

                    {/* Section 1: Roles */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-white">
                            <UserCheck className="w-6 h-6 text-blue-400" />
                            <h2 className="text-2xl font-bold italic">1. Roles and Responsibilities</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2 uppercase text-xs tracking-widest">Data Controller</h3>
                                <p className="text-sm text-slate-400">The educational institution (School) using EduFlow is the Data Controller. They determine the purpose and means of processing student and staff data.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2 uppercase text-xs tracking-widest">Data Processor</h3>
                                <p className="text-sm text-slate-400">EduFlow acts as the Data Processor. We process data according to instructions provided by the Controller under a strictly governed Service Level Agreement.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Data Types */}
                    <section className="space-y-6 bg-[#252936]/40 backdrop-blur-sm border border-white/5 p-8 rounded-[32px]">
                        <div className="flex items-center gap-3 text-white">
                            <Database className="w-6 h-6 text-emerald-400" />
                            <h2 className="text-2xl font-bold">2. Information We Collect</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-slate-400">To provide Nigeria&apos;s premier elite school operating system, we process:</p>
                            <ul className="grid sm:grid-cols-2 gap-4">
                                <li className="flex items-start gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                    <div>
                                        <span className="text-white font-bold block text-sm">Identity Records</span>
                                        <span className="text-xs text-slate-500">Full names, DOB, biometric data (where applicable), and government IDs.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                    <div>
                                        <span className="text-white font-bold block text-sm">Academic Integrity Data</span>
                                        <span className="text-xs text-slate-500">Exam scores, continuous assessments, and behavioral audit logs.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                    <div>
                                        <span className="text-white font-bold block text-sm">Financial Transaction Logs</span>
                                        <span className="text-xs text-slate-500">Tuition payments, wallet funding, and forensic fee recovery history.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                                    <div>
                                        <span className="text-white font-bold block text-sm">Technical Metadata</span>
                                        <span className="text-xs text-slate-500">IP addresses, login timestamps, and forensic session tokens.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3: Security */}
                    <section className="space-y-8">
                        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full">
                                <Lock className="w-6 h-6 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white">3. Forensic-Grade Security</h2>
                            <p className="text-slate-400">Data protection is the foundation of eliteness. EduFlow employs sovereign-grade encryption standards to safeguard Nigerian institutional data.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "AES-256 Encryption", desc: "Data is encrypted at rest and in transit using military-grade protocols." },
                                { title: "Isolated VPC", desc: "Multi-tenant logic is enforced at the database layer via strict RLS." },
                                { title: "Zero Trust Access", desc: "Every administrative action is digitally signed and logged forever." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 rounded-[24px] bg-[#252936]/80 border border-white/10 transition-transform hover:scale-[1.02]">
                                    <div className="font-bold text-blue-400 mb-2">{item.title}</div>
                                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 4: Subject Rights */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-white">
                            <UserCheck className="w-6 h-6 text-blue-400" />
                            <h2 className="text-2xl font-bold italic">4. Your NDPR Rights</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-slate-400">
                            <p>As a data subject under Nigerian law, you maintain the following rights over your personal data:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 not-prose">
                                {[
                                    "Right to Information", "Right to Access", "Right to Rectification", 
                                    "Right to Erasure", "Right to Object", "Data Portability"
                                ].map((right, i) => (
                                    <div key={i} className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-mono uppercase tracking-tighter text-blue-400 text-center">
                                        {right}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-6 text-sm">To exercise these rights, please contact the Data Protection Officer (DPO) of your respective school, or reach out to us at <span className="text-white font-mono">legal@eduflow.ng</span> if we are the primary point of collection.</p>
                        </div>
                    </section>

                    {/* Section 5: Third-Party & International Data Transfer */}
                    <section className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20">
                         <div className="flex items-center gap-3 text-white mb-6">
                            <HelpCircle className="w-6 h-6 text-cyan-400" />
                            <h2 className="text-2xl font-bold italic">5. Data Transfers</h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            We do not sell, trade, or rent personal information. Transfers to third-party sub-processors (e.g., Supabase for hosting, AWS for storage) are conducted under strict Data Processing Agreements. Any cross-border transfers are fulfilled in accordance with the provisions of <span className="text-white font-bold">Part VI of the Nigeria Data Protection Act.</span>
                        </p>
                    </section>

                    {/* Footer Contact */}
                    <div className="border-t border-white/10 pt-12 text-center pb-24">
                        <FileText className="w-10 h-10 text-slate-700 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-white mb-4">Questions or Remediation Requests?</h3>
                        <div className="text-slate-500 space-y-2 text-sm">
                            <p>{SITE_CONFIG.name} Legal Department</p>
                            <p>{SITE_CONFIG.hq.address}</p>
                            <p className="text-blue-400 font-mono">dpo@eduflow.ng</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
