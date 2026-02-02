import { AiGradebookVisual } from "@/components/landing/visuals/ai-gradebook-visual"
import { MobileResultVisual } from "@/components/landing/visuals/mobile-result-visual"
import { AttendanceMobileVisual } from "@/components/landing/visuals/attendance-mobile-visual"
import { Sparkles, Smartphone, Zap } from "lucide-react"

export function VisualProofSection() {
    return (
        <section className="py-24 bg-black overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-32">

                {/* 1. Academic Proof (AI Gradebook) */}
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="h-3 w-3" />
                            AI Report Architect
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white">
                            Write 500 Report Cards <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">In Under 2 Minutes.</span>
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                            Stop spending weekends writing generic comments. Our AI analyzes every test score and generates personalized, professional behavioral remarks instantly.
                        </p>
                    </div>
                    <div className="flex-1 w-full flex justify-center lg:justify-end perspective-1000">
                        <div className="transform rotate-y-[-5deg] hover:rotate-y-0 transition-transform duration-500">
                            <AiGradebookVisual />
                        </div>
                    </div>
                </div>

                {/* 2. Student Success (Mobile Result) */}
                <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
                    <div className="flex-1 w-full flex justify-center lg:justify-start">
                        <MobileResultVisual />
                    </div>
                    <div className="flex-1 space-y-6 text-left lg:text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider ml-auto">
                            <Smartphone className="h-3 w-3" />
                            Parent Mobile App
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white">
                            The "Pay-to-Unlock" <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Revenue Engine.</span>
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-lg ml-auto">
                            Automatic fee enforcement. Parents can see their child's face and attendance, but results are blurred until school fees are cleared.
                        </p>
                    </div>
                </div>

                {/* 3. High Speed Mobile (Attendance) */}
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                            <Zap className="h-3 w-3" />
                            Offline-First Engine
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white">
                            Optimized for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Real Devices.</span>
                        </h2>
                        <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                            Your teachers don't use iPhones. We designed our high-speed attendance toggle specifically for Infinix and Tecno devices running on 3G.
                        </p>
                    </div>
                    <div className="flex-1 w-full flex justify-center lg:justify-end">
                        <AttendanceMobileVisual />
                    </div>
                </div>

            </div>
        </section>
    )
}
