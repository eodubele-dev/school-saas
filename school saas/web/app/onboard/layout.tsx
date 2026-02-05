import Link from "next/link"
import { X } from "lucide-react"

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen bg-[#0A0A0B] flex flex-col overflow-hidden">
            <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-10 relative z-20">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                        <span className="text-white font-bold text-lg">EF</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-white tracking-tight text-lg">EduFlow</span>
                        <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Platinum_Edition</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-sm font-medium text-slate-400 flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        School Setup Wizard
                    </div>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors border border-white/5 hover:border-red-500/50 px-3 py-1.5 rounded-lg bg-white/5"
                    >
                        <X className="w-3.5 h-3.5" />
                        QUIT_SETUP
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-6 relative">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.1)_0%,transparent_70%)] pointer-events-none" />
                <div className="relative z-10 w-full flex justify-center">
                    {children}
                </div>
            </main>
        </div>
    )
}
