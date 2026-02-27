import Link from "next/link"
import { X } from "lucide-react"

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-screen bg-[#000000] flex flex-col overflow-hidden relative">
            {/* Background: Geometric Texture (Faint Grid) */}
            <div
                className="absolute inset-0 opacity-[0.15] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)',
                    maskImage: 'radial-gradient(circle at center, black 30%, transparent 90%)'
                }}
            />

            <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-10 relative z-20">
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
