"use client"

import Link from "next/link"
import { Sparkles, Twitter, Linkedin, Github, ArrowRight } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants/site-config"
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
                                alt={SITE_CONFIG.shortName}
                                className="h-[4.5rem] w-auto object-contain mix-blend-screen"
                            />
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            Empowering top 1% schools in Nigeria with {SITE_CONFIG.tagline.toLowerCase()}.
                        </p>

                        <div className="pt-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {SITE_CONFIG.hq.status}
                            </div>
                            <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
                                <strong className="block text-foreground mb-1">Lagos Headquarters</strong>
                                {SITE_CONFIG.hq.address}
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
                            <li>
                                <Link 
                                    href="https://jggcixrapxccbxckuofw.supabase.co/storage/v1/object/public/workstation-releases/EduFlow-Platinum_1.0.0_x64_en-US.msi"
                                    className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-2 group"
                                >
                                    Download Workstation
                                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </li>
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
                            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-400/30 active:scale-95"
                        >
                            Schedule Physical Demo
                        </button>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-600">
                        © {new Date().getFullYear()} {SITE_CONFIG.name}. All Rights Reserved. Built for Nigerian Excellence.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-xs text-slate-600 hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-xs text-slate-600 hover:text-foreground transition-colors">Terms</Link>
                        <div className="w-px h-4 bg-white/10 mx-2" />
                        <Link href={SITE_CONFIG.links.twitter} className="text-slate-600 hover:text-foreground transition-colors" aria-label="Follow us on Twitter"><Twitter className="h-4 w-4" /></Link>
                        <Link href={SITE_CONFIG.links.linkedin} className="text-slate-600 hover:text-foreground transition-colors" aria-label="Follow us on LinkedIn"><Linkedin className="h-4 w-4" /></Link>
                        <Link href={SITE_CONFIG.links.github} className="text-slate-600 hover:text-foreground transition-colors" aria-label="Follow us on GitHub"><Github className="h-4 w-4" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
