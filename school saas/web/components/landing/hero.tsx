import { Button } from "@/components/ui/button"
import { ArrowRight, PlayCircle, Monitor } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { isDesktop } from "@/lib/utils/desktop"

export function HeroSection() {
    const [showDownload, setShowDownload] = useState(false)

    useEffect(() => {
        // Only show download button if we are on the web
        setShowDownload(!isDesktop())
    }, [])

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-green/10 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-purple/30 bg-neon-purple/10 text-neon-purple text-xs font-medium mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-purple opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-purple"></span>
                    </span>
                    #1 School Management Platform in Africa
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
                    Empowering Teachers, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-emerald-green">
                        Engaging Students
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                    All your school administrative needs in one unified platform.
                    From offline-first attendance to AI-powered report cards.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Button asChild size="lg" className="bg-emerald-green hover:bg-emerald-600 text-foreground h-12 px-8 shadow-glow-green w-full sm:w-auto">
                        <Link href="/login">
                            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    
                    {showDownload && (
                        <Button asChild size="lg" variant="outline" className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-400 h-12 px-8 w-full sm:w-auto backdrop-blur-md group relative">
                            <Link href="https://jggcixrapxccbxckuofw.supabase.co/storage/v1/object/public/workstation-releases/EduFlow-Platinum_1.0.0_x64_en-US.msi">
                                <Monitor className="mr-2 h-4 w-4" /> Download for Windows
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                </span>
                            </Link>
                        </Button>
                    )}

                    <Button asChild size="lg" variant="outline" className="bg-transparent border-white/20 hover:bg-white/10 text-foreground h-12 px-8 w-full sm:w-auto backdrop-blur-md">
                        <Link href="#">
                            <PlayCircle className="mr-2 h-4 w-4" /> Watch Demo
                        </Link>
                    </Button>
                </div>

                {/* Mockup Container */}
                <div className="relative mx-auto max-w-5xl rounded-xl border border-border bg-secondary/50 p-2 backdrop-blur-sm shadow-2xl">
                    <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-card text-card-foreground flex flex-col group border border-border/50">

                        {/* Fake Browser/App Header */}
                        <div className="h-8 bg-slate-950 border-b border-border/50 flex items-center px-4 gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                            </div>
                            <div className="ml-4 h-4 w-40 bg-secondary/50 rounded-full"></div>
                        </div>

                        {/* App Body */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Sidebar */}
                            <div className="w-48 bg-slate-950/50 border-r border-border/50 p-4 flex flex-col gap-3 hidden md:flex">
                                <div className="h-8 w-24 bg-neon-purple/20 rounded mb-4"></div>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="h-6 w-full bg-secondary/50 rounded hover:bg-white/10 transition-colors"></div>
                                ))}
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6 bg-card text-card-foreground/50 relative">
                                {/* Grid Pattern */}
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                                {/* Header */}
                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <div className="h-8 w-32 bg-white/10 rounded"></div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 rounded-full bg-indigo-500/20"></div>
                                        <div className="h-8 w-8 rounded-full bg-emerald-500/20"></div>
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                                    <div className="h-24 rounded-lg bg-secondary/50 border border-border/50 p-4">
                                        <div className="h-4 w-4 rounded bg-neon-purple/50 mb-3"></div>
                                        <div className="h-6 w-16 bg-white/10 rounded"></div>
                                    </div>
                                    <div className="h-24 rounded-lg bg-secondary/50 border border-border/50 p-4">
                                        <div className="h-4 w-4 rounded bg-emerald-green/50 mb-3"></div>
                                        <div className="h-6 w-16 bg-white/10 rounded"></div>
                                    </div>
                                    <div className="h-24 rounded-lg bg-secondary/50 border border-border/50 p-4">
                                        <div className="h-4 w-4 rounded bg-blue-500/50 mb-3"></div>
                                        <div className="h-6 w-16 bg-white/10 rounded"></div>
                                    </div>
                                </div>

                                {/* Chart Area */}
                                <div className="h-48 rounded-lg bg-secondary/50 border border-border/50 p-4 relative z-10 flex items-end justify-between gap-2">
                                    {[30, 45, 25, 60, 75, 50, 80, 55, 70, 90].map((h, i) => (
                                        <div key={i} className="w-full bg-emerald-500/20 rounded-t hover:bg-emerald-500/40 transition-colors" style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Badge Example */}
                    <div className="absolute -right-4 top-10 bg-obsidian border border-border p-4 rounded-xl shadow-xl hidden md:block animate-bounce [animation-duration:3s]">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-green/20 flex items-center justify-center text-emerald-green">
                                ₦
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Revenue</p>
                                <p className="text-lg font-bold text-foreground">₦1.2M</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
