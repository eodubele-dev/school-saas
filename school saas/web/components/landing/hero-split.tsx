'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Wallet } from "lucide-react"
import { ExecutiveDashVisual } from "@/components/landing/visuals/executive-dash-visual"

export function HeroSplit() {
    return (
        <section className="relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-center pt-24 pb-12 lg:pt-0 lg:pb-0 overflow-hidden bg-slate-950">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[128px] opacity-40 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[128px] opacity-40 pointer-events-none" />

            {/* Left Content */}
            <div className="flex-1 w-full max-w-2xl px-6 lg:px-12 xl:pl-24 z-10 flex flex-col gap-6 lg:gap-8 text-center lg:text-left">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                    <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 backdrop-blur-md">
                        <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
                        Trusted by 50+ Top Tier Schools
                    </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                    The Operating System for <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Nigeria&apos;s Top 1% Schools.</span>
                </h1>

                <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                    Eliminate fee leakage, automate NERDC report cards in seconds, and give your parents a world-class digital experience—even offline.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12 text-base shadow-lg shadow-blue-500/20 transition-transform hover:scale-105">
                        Start Free Pilot
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full px-8 h-12 text-base">
                        Book Executive Demo
                    </Button>
                </div>

                <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> CBN Compliant</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> NDPR Secure</span>
                </div>
            </div>

            {/* Right Visual (Split Hero) */}
            <div className="flex-1 w-full h-full min-h-[400px] lg:min-h-[500px] relative mt-12 lg:mt-0 flex items-center justify-center p-6 lg:p-12">
                <div className="relative w-full max-w-[600px] group perspective-1000">
                    {/* Glowing Backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />

                    {/* The Executive Dashboard Component */}
                    <div className="relative transform transition-all duration-700 hover:scale-[1.02] hover:rotate-1">
                        <ExecutiveDashVisual />
                    </div>

                    {/* Floating Mobile Badge */}
                    <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl flex items-center gap-3 animate-float delay-1000">
                        <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Today's Collection</div>
                            <div className="text-sm font-bold text-white">₦450,000</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
