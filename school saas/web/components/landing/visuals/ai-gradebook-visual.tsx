'use client'

import { Sparkles, Bot } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AiGradebookVisual() {
    const [text, setText] = useState("")
    const fullText = "David shows excellent aptitude in Mathematics. He consistently participates in class and demonstrates strong problem-solving skills. Recommended for Science Club."

    useEffect(() => {
        let i = 0
        const timer = setInterval(() => {
            setText(fullText.slice(0, i))
            i++
            if (i > fullText.length) {
                // Pause then reset
                setTimeout(() => { i = 0 }, 2000)
            }
        }, 50) // Typing speed
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden max-w-md w-full font-sans">
            <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" />
                        <AvatarFallback>DO</AvatarFallback>
                    </Avatar>
                    <div className="leading-none">
                        <div className="text-sm font-bold text-slate-200">David Odubele</div>
                        <div className="text-[10px] text-slate-500">JSS 2A • Mathematics</div>
                    </div>
                </div>
                <div className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded font-mono border border-blue-500/20">
                    Term 2
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1 bg-slate-900 rounded p-2 border border-slate-800">
                        <div className="text-[10px] text-slate-500 mb-1">C.A Test</div>
                        <div className="text-lg font-bold text-white">18<span className="text-slate-600 text-xs">/20</span></div>
                    </div>
                    <div className="flex-1 bg-slate-900 rounded p-2 border border-slate-800">
                        <div className="text-[10px] text-slate-500 mb-1">Exam</div>
                        <div className="text-lg font-bold text-white">64<span className="text-slate-600 text-xs">/70</span></div>
                    </div>
                    <div className="flex-1 bg-green-500/10 rounded p-2 border border-green-500/20">
                        <div className="text-[10px] text-green-400 mb-1">Total</div>
                        <div className="text-lg font-bold text-green-400">82<span className="text-green-600/50 text-xs py-0.5 px-1 rounded bg-green-900/20 ml-1">A</span></div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute -top-3 left-2 px-1 bg-slate-950 text-[10px] text-purple-400 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Remark
                    </div>
                    <div className="h-24 bg-slate-900/50 border border-purple-500/30 rounded-lg p-3 text-xs text-slate-300 leading-relaxed font-mono relative">
                        {text}
                        <span className="w-1.5 h-3 bg-purple-500 inline-block ml-0.5 animate-blink align-middle"></span>
                    </div>
                </div>

                <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                    <Bot className="h-4 w-4" />
                    Regenerate with Gemini
                </button>
            </div>
        </div>
    )
}
