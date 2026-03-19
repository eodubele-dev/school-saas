"use client"

import { Home, Users, MessageSquare, User, Menu, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function MobileShell({ children, domain }: { children: React.ReactNode, domain: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const NAV_ITEMS = [
        { icon: Home, label: 'Home', href: `/mobile/teacher` },
        { icon: Users, label: 'Attendance', href: `/mobile/teacher/attendance` },
        { icon: MessageSquare, label: 'Msgs', href: `/mobile/teacher/messages` },
        { icon: User, label: 'Profile', href: `/mobile/teacher/profile` },
    ]

    return (
        <div className="flex flex-col h-screen bg-slate-950 max-w-md mx-auto relative border-x border-border/50 shadow-2xl overflow-hidden">
            {/* Side Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 w-[70%] h-full bg-slate-900 border-l border-border z-[101] p-6 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold text-slate-400 uppercase text-xs tracking-widest">Menu</span>
                                <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 hover:text-white">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <nav className="space-y-4">
                                <button 
                                    onClick={() => {
                                        setIsMenuOpen(false)
                                        router.push(`/${domain}/dashboard`)
                                    }}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition-colors border border-blue-500/20"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    <span className="font-bold">Return to Dashboard</span>
                                </button>

                                <div className="h-px bg-border my-6" />
                                
                                {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
                                    <Link
                                        key={label}
                                        href={href.replace('/mobile/teacher', `/${domain}/mobile/teacher`)}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="h-16 border-b border-border flex items-center justify-between px-4 bg-card text-card-foreground z-10">
                <div className="font-bold text-lg text-foreground tracking-tight">EduFlow<span className="text-[var(--school-accent)]">.Mobile</span></div>
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 text-muted-foreground hover:text-white transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </header>

            {/* Main Content (Scrollable) */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 p-4">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="h-16 absolute bottom-0 left-0 right-0 bg-card text-card-foreground border-t border-border flex items-center justify-around z-20 pb-safe">
                {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
                    const isActive = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link
                            key={label}
                            href={href.replace('/mobile/teacher', `/${domain}/mobile/teacher`)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[var(--school-accent)]' : 'text-muted-foreground hover:text-slate-300'}`}
                        >
                            <Icon className={`h-6 w-6 transition-transform ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
