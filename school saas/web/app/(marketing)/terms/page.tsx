import Link from "next/link"
import { ArrowLeft, Scale, Gavel, AlertTriangle, CreditCard, Ban, RefreshCw, Landmark } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants/site-config"

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-black text-slate-200 py-24 px-4 md:px-8 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
            <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }} />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-400 mb-12 transition-all hover:-translate-x-1 group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
                </Link>

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30">
                        <Scale className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Terms of Service</h1>
                        <p className="text-blue-400 font-mono text-xs mt-1 uppercase tracking-widest">NIGERIAN JURISDICTION • SaaS MASTER AGREEMENT</p>
                    </div>
                </div>

                <div className="space-y-12 mt-16">
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
                                <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    Platform Access
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">Subject to the payment of applicable fees, we grant the School a non-exclusive, non-transferable right to access the EduFlow Platinum operating system for administrative and academic purposes.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-[#252936]/40 border border-white/5">
                                <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                    Uptime Commitment
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">We aim for 99.9% platform availability, excluding scheduled maintenance. Support for Nigerian institutions is provided via our Lagos HQ during standard business hours.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Data Ownership */}
                    <section className="bg-[#252936]/80 backdrop-blur-md border border-white/10 p-8 rounded-[32px] overflow-hidden">
                        <div className="flex items-center gap-3 text-white mb-6">
                            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin-slow" />
                            <h2 className="text-2xl font-bold">2. Data Proprietary Rights</h2>
                        </div>
                        <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
                            <p>
                                The School retains absolute ownership of all &quot;School Data&quot; uploaded to the platform, including student records, staff details, and financial logs.
                            </p>
                            <p>
                                By using the service, the School grants EduFlow a limited, royalty-free license to host, store, and process this data <span className="text-white font-bold italic">strictly</span> for the purpose of providing the service and generating anonymized institutional analytics.
                            </p>
                        </div>
                    </section>

                    {/* Section 3: Fees & Billing */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-white">
                            <CreditCard className="w-6 h-6 text-amber-400" />
                            <h2 className="text-2xl font-bold">3. Financial Terms</h2>
                        </div>
                        <div className="prose prose-invert max-w-none text-slate-400 text-sm">
                            <ul className="list-disc pl-5 space-y-3">
                                <li><strong className="text-white">Currency:</strong> All fees are quoted and payable in Nigerian Naira (NGN) unless otherwise specified in an executive Master Service Agreement.</li>
                                <li><strong className="text-white">Taxes:</strong> Fees are exclusive of Value Added Tax (VAT) and any other applicable Nigerian government levies.</li>
                                <li><strong className="text-white">Arrears:</strong> Failure to settle tuition or platform fees within the grace period may result in administrative restricted access to the platform.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4: Prohibited Conduct */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-white">
                            <Ban className="w-6 h-6 text-red-500" />
                            <h2 className="text-2xl font-bold italic text-red-100">4. Restricted Activities</h2>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                "Reverse Engineering", "Unsolicited Scraping", "Credential Sharing",
                                "API Overloading", "Academic Dishonesty", "Illegal Data Entry"
                            ].map((item, i) => (
                                <div key={i} className="px-4 py-3 rounded-xl border border-red-500/10 bg-red-500/5 text-[10px] font-bold uppercase tracking-widest text-red-400 text-center">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 5: Limitation of Liability */}
                    <section className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3 text-white mb-6">
                            <AlertTriangle className="w-6 h-6 text-slate-500" />
                            <h2 className="text-2xl font-bold text-slate-300 italic">5. Liability Limitations</h2>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed italic">
                            To the maximum extent permitted under the laws of the Federal Republic of Nigeria, EduFlow Synergy Systems shall not be liable for any indirect, incidental, or consequential damages resulting from school-side administrative errors, network instability, or unauthorized local access.
                        </p>
                    </section>

                    {/* Section 6: Governance */}
                    <section className="space-y-6 border-t border-white/10 pt-12">
                        <div className="flex items-center gap-3 text-white">
                            <Gavel className="w-6 h-6 text-blue-400" />
                            <h2 className="text-2xl font-bold">6. Governing Law</h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            This Agreement and any dispute arising out of it shall be governed by and construed in accordance with the laws of the <span className="text-white font-bold underline underline-offset-4 decoration-blue-500/50">Federal Republic of Nigeria</span>. Any disputes shall be resolved through binding arbitration in Lagos, Nigeria.
                        </p>
                    </section>

                    {/* Final CTA */}
                    <div className="text-center py-12">
                        <p className="text-xs text-slate-700 uppercase tracking-[0.2em] mb-4">© 2026 EduFlow Synergy Systems</p>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">By continuing to use the platform, you uphold the integrity of Nigerian Education.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
