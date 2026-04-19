"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Sparkles, BookOpen, PlayCircle, Play } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useExecutiveConversion } from "./executive-context"
import { SITE_CONFIG } from "@/lib/constants/site-config"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { openTenantPreview, toggleMegaMenu, openPhysicalDemo, scrollToSection, openSupport } = useExecutiveConversion()

    return (
        // 1. the 'Infinite Obsidian' Navigation
        <nav className="fixed top-0 w-full z-50 border-b-[0.5px] border-[rgba(255,255,255,0.08)] bg-black/80 backdrop-blur-[25px]">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                {/* Left Side: Logo & Links */}
                {/* Left Side: Logo */}
                <div className="flex items-center gap-12 relative">
                    {/* Glow Anchor */}
                    <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-[140px] h-[140px] pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(0, 245, 255, 0.08) 0%, transparent 70%)' }}>
                    </div>

                    <Link href="/" className="flex items-center gap-2 group relative z-10 transition-transform duration-300 hover:scale-[1.02]">
                        <img
                            src="/visuals/eduflow-logo.png?v=3"
                            alt="EduFlow"
                            className="h-[4.5rem] w-auto object-contain mix-blend-screen"
                        />
                    </Link>
                </div>

                {/* Center: Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
                        <button
                            key={item}
                            onClick={() => item === 'Contact' ? openSupport() : scrollToSection(item.toLowerCase())}
                            className={`text-base font-medium transition-colors relative group ${item === 'Features' ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {item}
                            {/* Active/Hover State Line */}
                            <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4] transition-all group-hover:w-full" />
                        </button>
                    ))}
                </div>
                {/* Right Side: Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Documentation Link - FAINT */}
                    <Link
                        href="/docs"
                        className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-slate-300 transition-colors uppercase tracking-widest mr-2"
                    >
                        <BookOpen className="h-3 w-3" />
                        Documentation
                    </Link>

                    {/* Log in */}
                    <Link href="/login" className="text-base font-medium text-foreground hover:text-blue-400 transition-colors px-1">
                        Log in
                    </Link>

                    {/* Try it free Button */}
                    <button
                        onClick={openTenantPreview}
                        className="bg-blue-600 text-white font-bold rounded-full px-6 py-2.5 text-sm shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all duration-300 hover:scale-[1.05] active:scale-95 border border-blue-500/50"
                    >
                        Access Portal
                    </button>
                </div>

                {/* Mobile Nav Toggle */}
                <Button variant="ghost" size="icon" className="md:hidden text-slate-300 hover:text-foreground" onClick={() => setIsOpen(!isOpen)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-border p-4 absolute w-full top-20 left-0 flex flex-col gap-4 shadow-2xl"
                >
                    {['Home', 'Features', 'Pricing'].map((item) => (
                        <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-foreground p-2 hover:bg-secondary/50 rounded">
                            {item}
                        </Link>
                    ))}
                    <button 
                        onClick={() => { setIsOpen(false); openSupport(); }} 
                        className="text-left text-sm font-medium text-slate-300 hover:text-foreground p-2 hover:bg-secondary/50 rounded"
                    >
                        Contact
                    </button>
                    <div className="h-px bg-white/10 my-2" />
                    <Link href="/docs" className="text-sm font-medium text-muted-foreground p-2">Documentation</Link>
                    <Link href="/login" className="text-sm font-bold text-foreground p-2">Log in</Link>
                    <button
                        onClick={() => { setIsOpen(false); openTenantPreview(); }}
                        className="w-full bg-white text-black font-bold py-4 rounded-full shadow-lg transition-all duration-300 active:scale-95"
                    >
                        Access Portal
                    </button>
                </motion.div>
            )}
        </nav>
    )
}
