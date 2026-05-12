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
    const { openTenantPreview, toggleMegaMenu, openPhysicalDemo, scrollToSection, openSupport, pathname } = useExecutiveConversion()

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
                    {['Home', 'Features', 'Pricing', 'Contact'].map((item) => {
                        const sectionId = item.toLowerCase();
                        const href = item === 'Home' ? '/' : `/?goto=${sectionId}`;

                        if (item === 'Contact') {
                            return (
                                <button
                                    key={item}
                                    onClick={openSupport}
                                    className="text-base font-medium transition-colors relative group text-muted-foreground hover:text-foreground"
                                >
                                    {item}
                                    <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4] transition-all group-hover:w-full" />
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item}
                                href={href}
                                onClick={(e) => {
                                    if (pathname === '/') {
                                        e.preventDefault();
                                        scrollToSection(sectionId);
                                    }
                                }}
                                className="text-base font-medium transition-colors relative group text-muted-foreground hover:text-foreground"
                            >
                                {item}
                                <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4] transition-all group-hover:w-full" />
                            </Link>
                        );
                    })}
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
                        Get Started Free
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
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-[#0a0a0a]/98 backdrop-blur-3xl border-b border-white/10 p-6 absolute w-full top-20 left-0 flex flex-col gap-6 shadow-2xl z-[60]"
                >
                    <div className="flex flex-col gap-2">
                        {['Home', 'Features', 'Pricing'].map((item) => (
                            <button 
                                key={item} 
                                onClick={() => {
                                    setIsOpen(false);
                                    scrollToSection(item.toLowerCase());
                                }} 
                                className="text-left text-lg font-bold text-slate-400 hover:text-blue-400 p-3 hover:bg-white/5 rounded-xl transition-all"
                            >
                                {item}
                            </button>
                        ))}
                        <button 
                            onClick={() => { setIsOpen(false); openSupport(); }} 
                            className="text-left text-lg font-bold text-slate-400 hover:text-blue-400 p-3 hover:bg-white/5 rounded-xl transition-all"
                        >
                            Contact
                        </button>
                    </div>

                    <div className="h-px bg-white/5 my-2" />
                    
                    <div className="flex flex-col gap-4 px-2">
                        <Link href="/docs" onClick={() => setIsOpen(false)} className="text-sm font-bold text-slate-500 uppercase tracking-widest hover:text-white">Documentation</Link>
                        <Link href="/login" onClick={() => setIsOpen(false)} className="text-lg font-black text-white hover:text-blue-400">Log in</Link>
                    </div>

                    <button
                        onClick={() => { setIsOpen(false); openTenantPreview(); }}
                        className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95 text-lg"
                    >
                        Get Started Free
                    </button>
                </motion.div>
            )}
        </nav>
    )
}
