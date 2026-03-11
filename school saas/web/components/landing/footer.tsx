"use client"

import Link from "next/link"
import { Sparkles, Twitter, Linkedin, Github } from "lucide-react"
import { useExecutiveConversion } from "./executive-context"

export function Footer() {
    const { scrollToSection, openSupport, openPhysicalDemo } = useExecutiveConversion()
    return (
        <footer className="border-t border-border/50 bg-black pt-24 pb-12 relative z-10">
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
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            Empowering top 1% schools in Nigeria with forensic-grade operating systems.
                        </p>

                        <div className="pt-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                All Systems Operational
                            </div>
                            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
                                <strong className="block text-foreground mb-1">Lagos Headquarters</strong>
                                12A Ligali Ayorinde St,<br />
                                Victoria Island, Lagos.
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-bold text-foreground mb-6">Product</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><button onClick={() => scrollToSection('audit-integrity', true)} className="hover:text-blue-400 transition-colors text-left">Forensic Audit</button></li>
                            <li><button onClick={() => scrollToSection('revenue-engine', true)} className="hover:text-blue-400 transition-colors text-left">Revenue Engine</button></li>
                            <li><button onClick={() => scrollToSection('campus-logistics', true)} className="hover:text-blue-400 transition-colors text-left">Campus Logistics</button></li>
                            <li><button onClick={() => scrollToSection('pricing')} className="hover:text-blue-400 transition-colors text-left">Pricing</button></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-bold text-foreground mb-6">Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                            <li><Link href="/success-stories" className="hover:text-foreground transition-colors">Success Stories</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
                            <li><button onClick={openSupport} className="hover:text-foreground transition-colors text-left">Contact Support</button></li>
                        </ul>
                    </div>

                    {/* Action Column */}
                    <div>
                        <h4 className="font-bold text-foreground mb-6">Schedule</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Need a closer look? Visit our purpose-built experience center.
                        </p>
                        <button
                            onClick={openPhysicalDemo}
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-foreground text-sm font-medium border border-border transition-all hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        >
                            Schedule Physical Demo
                        </button>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">
                        © 2026 EduCare Inc. Built for Nigerian Excellence.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-xs text-slate-600 hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-xs text-slate-600 hover:text-foreground transition-colors">Terms</Link>
                        <div className="w-px h-4 bg-white/10 mx-2" />
                        <Link href="#" className="text-slate-600 hover:text-foreground transition-colors"><Twitter className="h-4 w-4" /></Link>
                        <Link href="#" className="text-slate-600 hover:text-foreground transition-colors"><Linkedin className="h-4 w-4" /></Link>
                        <Link href="#" className="text-slate-600 hover:text-foreground transition-colors"><Github className="h-4 w-4" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
