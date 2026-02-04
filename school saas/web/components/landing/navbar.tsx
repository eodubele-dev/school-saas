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
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                            <Sparkles className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-200 transition-colors">EduFlow</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {['Home', 'Features', 'Pricing', 'Contact'].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-blue-500 transition-all group-hover:w-full" />
                            </Link>
                        ))}
                    </div>
                </div>


                {/* Right Side: Actions */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Documentation Ghost Link */}
                    <Link href="/docs" className="text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 group">
                        <BookOpen className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        Documentation
                    </Link>

                    <div className="h-4 w-[1px] bg-white/10" />

                    {/* Log in */}
                    <Link href="/login" className="text-sm font-bold text-white hover:text-blue-400 transition-colors">
                        Log in
                    </Link>

                    {/* Try it free Button */}
                    <Button
                        asChild
                        className="bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold rounded-lg shadow-[0_0_20px_-5px_rgba(0,102,255,0.5)] border border-blue-400/20 px-6"
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
