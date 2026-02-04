"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Sparkles, BookOpen } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        // 1. the 'Infinite Obsidian' Navigation
        <nav className="fixed top-0 w-full z-50 border-b-[0.5px] border-[rgba(255,255,255,0.08)] bg-transparent backdrop-blur-[25px]">
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
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className={`text-base font-medium transition-colors relative group ${item === 'Features' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            {item}
                            {/* Active/Hover State Line */}
                            {item === 'Features' && (
                                <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right Side: Actions */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Documentation - Ghost Link */}
                    <Link href="/docs" className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all duration-300">
                        <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-200 transition-colors">Documentation</span>
                    </Link>

                    {/* Log in */}
                    <Link href="/login" className="text-base font-medium text-white hover:text-blue-400 transition-colors px-2">
                        Log in
                    </Link>

                    {/* Try it free Button */}
                    <Button
                        asChild
                        className="bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold rounded-lg px-8 py-6 text-base shadow-[0_0_30px_-5px_rgba(0,102,255,0.4)] transition-all hover:scale-105"
                    >
                        <Link href="/signup">Try it free</Link>
                    </Button>
                </div>

                {/* Mobile Nav Toggle */}
                <Button variant="ghost" size="icon" className="md:hidden text-slate-300 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 p-4 absolute w-full top-20 left-0 flex flex-col gap-4 shadow-2xl"
                >
                    {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
                        <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded">
                            {item}
                        </Link>
                    ))}
                    <div className="h-px bg-white/10 my-2" />
                    <Link href="/docs" className="text-sm font-medium text-slate-400 p-2">Documentation</Link>
                    <Link href="/login" className="text-sm font-bold text-white p-2">Log in</Link>
                    <Button asChild className="w-full bg-[#0066FF] text-white font-bold shadow-lg shadow-blue-900/20">
                        <Link href="/signup">Try it free</Link>
                    </Button>
                </motion.div>
            )}
        </nav>
    )
}
