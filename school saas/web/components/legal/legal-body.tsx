import { SITE_CONFIG } from "@/lib/constants/site-config"
import { Shield, UserCheck, Database, Lock, User, Terminal, Landmark, Gavel, Scale, CreditCard, Ban, AlertTriangle, RefreshCw } from "lucide-react"

interface LegalBodyProps {
    type: 'privacy' | 'terms'
}

export function LegalBody({ type }: LegalBodyProps) {
    if (type === 'privacy') {
        return (
            <div className="space-y-12">
                {/* Intro */}
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

                {/* Section 3: Subject Rights */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 text-white">
                        <User className="w-6 h-6 text-blue-400" />
                        <h2 className="text-2xl font-bold italic">3. Your NDPR Rights</h2>
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
                    </div>
                </section>

                {/* Section 4: Security */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-white">
                        <Lock className="w-6 h-6 text-red-500" />
                        <h2 className="text-2xl font-bold">4. Forensic Security</h2>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Data is encrypted using AES-256 protocols and stored in isolated VPC environments. Every administrative action on the platform is digitally signed and logged to a tamper-proof forensic audit trail.
                    </p>
                </section>
            </div>
        )
    }

    return (
        <div className="space-y-12">
            {/* Agreement Status */}
            <div className="bg-[#252936]/80 backdrop-blur-md border border-white/10 p-8 rounded-[32px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Gavel className="w-24 h-24 text-white" />
                </div>
                <p className="text-sm text-slate-500 italic mb-8 border-l-2 border-blue-500 pl-4 font-mono">Last Updated: April 19, 2026</p>
                <div className="prose prose-invert max-w-none text-slate-300">
                    <p className="text-lg leading-relaxed">
                        These Terms of Service (&quot;Agreement&quot;) constitute a legally binding agreement between your educational institution (&quot;the School&quot;) and <span className="text-white font-bold">{SITE_CONFIG.name}</span>. By accessing the Platform, you acknowledge that you have read, understood, and agree to be bound by these provisions under the laws of the <span className="text-blue-400">Federal Republic of Nigeria.</span>
                    </p>
                </div>
            </div>

            {/* Section 1: Provision of Service */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 text-white">
                    <Landmark className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold">1. Service Provisioning</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-[#252936]/40 border border-white/5">
                        <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            Platform Access
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">Subject to the payment of applicable fees, we grant the School a non-exclusive, non-transferable right to access the EduFlow Platinum operating system for administrative and academic purposes.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[#252936]/40 border border-white/5">
                        <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2 uppercase tracking-widest text-[10px]">
                            Uptime Commitment
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">We aim for 99.9% platform availability, excluding scheduled maintenance. Support for Nigerian institutions is provided via our Lagos HQ.</p>
                    </div>
                </div>
            </section>

            {/* Section 2: Data Ownership */}
            <section className="bg-[#252936]/80 backdrop-blur-md border border-white/10 p-8 rounded-[32px] overflow-hidden">
                <div className="flex items-center gap-3 text-white mb-6">
                    <RefreshCw className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold">2. Data Proprietary Rights</h2>
                </div>
                <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
                    <p>The School retains absolute ownership of all &quot;School Data&quot; uploaded to the platform, including student records, staff details, and financial logs.</p>
                    <p>By using the service, the School grants EduFlow a limited, royalty-free license to host, store, and process this data for the purpose of providing the service.</p>
                </div>
            </section>

            {/* Section 3: Financial Terms */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 text-white">
                    <CreditCard className="w-6 h-6 text-amber-400" />
                    <h2 className="text-2xl font-bold">3. Financial Terms</h2>
                </div>
                <div className="prose prose-invert max-w-none text-slate-400 text-sm">
                    <ul className="list-disc pl-5 space-y-3">
                        <li><strong className="text-white">Currency:</strong> Fees are quoted in Nigerian Naira (NGN).</li>
                        <li><strong className="text-white">Taxes:</strong> Fees are exclusive of Value Added Tax (VAT).</li>
                        <li><strong className="text-white">Arrears:</strong> Late payments may result in administrative restricted access.</li>
                    </ul>
                </div>
            </section>

            {/* Section 4: Prohibited Conduct */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 text-white">
                    <Ban className="w-6 h-6 text-red-500" />
                    <h2 className="text-2xl font-bold italic text-red-100">4. Restricted Activities</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        "Reverse Engineering", "Unsolicited Scraping", "Credential Sharing",
                        "API Overloading", "Academic Dishonesty", "Illegal Data Entry"
                    ].map((item, i) => (
                        <div key={i} className="px-4 py-2 rounded-xl border border-red-500/10 bg-red-500/5 text-[8px] font-bold uppercase tracking-widest text-red-400 text-center">
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 5: Governance */}
            <section className="space-y-6 border-t border-white/10 pt-12">
                <div className="flex items-center gap-3 text-white">
                    <Scale className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold">5. Governing Law</h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                    This Agreement shall be governed by and construed in accordance with the laws of the <span className="text-white font-bold underline underline-offset-4 decoration-blue-500/50">Federal Republic of Nigeria</span>. Disputes shall be resolved through binding arbitration in Lagos.
                </p>
            </section>
        </div>
    )
}
