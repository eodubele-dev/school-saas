"use client"

import Link from "next/link"
import { Sparkles, Twitter, Linkedin, Github } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black pt-24 pb-12 relative z-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="block">
                            <img
                                src="/visuals/eduflow-logo.png?v=3"
                                alt="EduFlow"
                                className="h-[4.5rem] w-auto object-contain mix-blend-screen"
                            />
                        </Link>
                        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                            Empowering top 1% schools in Nigeria with forensic-grade operating systems.
                        </p>

                        <div className="pt-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                All Systems Operational
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400">
                                <strong className="block text-white mb-1">Lagos Headquarters</strong>
                                12A Ligali Ayorinde St,<br />
                                Victoria Island, Lagos.
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Product</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Forensic Audit</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Revenue Engine</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Campus Logistics</Link></li>
                            <li><Link href="#" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Success Stories</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* Action Column */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Schedule</h4>
                        <p className="text-sm text-slate-500 mb-4">
                            Need a closer look? Visit our purpose-built experience center.
                        </p>
                        <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition-all">
                            Schedule Physical Demo
                        </button>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">
                        © 2026 EduCare Inc. Built for Nigerian Excellence.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-slate-600 hover:text-white transition-colors"><Twitter className="h-4 w-4" /></Link>
                        <Link href="#" className="text-slate-600 hover:text-white transition-colors"><Linkedin className="h-4 w-4" /></Link>
                        <Link href="#" className="text-slate-600 hover:text-white transition-colors"><Github className="h-4 w-4" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
