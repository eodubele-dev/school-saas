import Link from "next/link"
import { X } from "lucide-react"

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#000000] flex flex-col overflow-y-auto relative">
            {/* 1. Background: 'Blue Obsidian' Canvas */}
            <div className="absolute inset-0 z-0 pointer-events-none">

                {/* Atmospheric Lighting 1: Behind Central Text */}
                <div
                    className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }}
                />

                {/* Atmospheric Lighting 2: Behind Right-Side Widgets */}
                <div
                    className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-40 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }}
                />
            </div>

            <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-10 fixed top-0 w-full z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-0 group relative z-10 transition-transform duration-300 hover:scale-[1.02]">
                        <img
                            src="/visuals/eduflow-logo.png?v=3"
                            alt="EduFlow"
                            className="h-[4.5rem] w-auto object-contain mix-blend-screen"
                        />
                    </Link>
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
                        QUIT SETUP
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center justify-start p-6 pt-[104px] pb-24 relative min-h-max">
                {/* Background Glow */}
                {/* Removed original radial gradient since new background is applied */}
                <div className="relative z-10 w-full flex justify-center">
                    {children}
                </div>
            </main>
        </div>
    )
}
