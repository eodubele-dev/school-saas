"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Sparkles } from "lucide-react"
import { useState } from "react"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-obsidian/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white">
                    <Sparkles className="h-5 w-5 text-neon-purple" />
                    <span>EduCare</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Pricing
                    </Link>
                    <Link href="#testimonials" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Testimonials
                    </Link>
                    <Button asChild className="bg-emerald-green hover:bg-emerald-600 text-white shadow-glow-green">
                        <Link href="/login">Get Started</Link>
                    </Button>
                </div>

                {/* Mobile Nav Toggle */}
                <Button variant="ghost" size="icon" className="md:hidden text-slate-300 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-obsidian border-b border-white/10 p-4 absolute w-full top-16 left-0 flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Link href="#features" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white">Features</Link>
                    <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white">Pricing</Link>
                    <Link href="#testimonials" onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-white">Testimonials</Link>
                    <Button asChild className="w-full bg-emerald-green text-white">
                        <Link href="/login">Get Started</Link>
                    </Button>
                </div>
            )}
        </nav>
    )
}

