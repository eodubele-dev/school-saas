"use client"

import Link from "next/link"
import { Sparkles, Twitter, Linkedin, Github } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white">
                            <Sparkles className="h-5 w-5 text-neon-purple" />
                            <span>EduCare</span>
                        </Link>
                        <p className="text-sm text-slate-400">
                            Empowering African schools with world-class operating systems.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-white">Features</Link></li>
                            <li><Link href="#" className="hover:text-white">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-white">API</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-white">About</Link></li>
                            <li><Link href="#" className="hover:text-white">Blog</Link></li>
                            <li><Link href="#" className="hover:text-white">Careers</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                            <li><Link href="#" className="hover:text-white">Terms</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                        © 2026 EduCare Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-slate-400 hover:text-white"><Twitter className="h-4 w-4" /></Link>
                        <Link href="#" className="text-slate-400 hover:text-white"><Linkedin className="h-4 w-4" /></Link>
                        <Link href="#" className="text-slate-400 hover:text-white"><Github className="h-4 w-4" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
