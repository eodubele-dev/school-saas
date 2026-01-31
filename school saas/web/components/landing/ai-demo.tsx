"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"

export function AiDemo() {
    const [score, setScore] = useState(72)
    const [remark, setRemark] = useState("")
    const [loading, setLoading] = useState(false)

    const generateRemark = async () => {
        setLoading(true)
        setRemark("")

        // Simulating Gemini API latency
        await new Promise(resolve => setTimeout(resolve, 1500))

        let generated = ""
        if (score >= 70) generated = `Excellent performance! With a score of ${score}%, the student demonstrates strong understanding. Keep it up!`
        else if (score >= 50) generated = `Good effort (${score}%). There is room for improvement in key areas. Regular practice is recommended.`
        else generated = `Needs attention (${score}%). We recommend extra tutoring support to help grasp fundamental concepts.`

        // Typing effect simulation
        setLoading(false)
        let i = 0
        const interval = setInterval(() => {
            setRemark(generated.substring(0, i))
            i++
            if (i > generated.length) clearInterval(interval)
        }, 30) // Fast typing
    }

    return (
        <section className="py-24 container mx-auto px-4">
            <div className="bg-gradient-to-br from-obsidian to-black border border-white/10 rounded-2xl p-8 md:p-12 overflow-hidden relative">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-neon-purple/20 rounded-full blur-[80px]" />

                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center gap-2 text-neon-purple font-medium mb-4">
                            <Sparkles className="h-5 w-5" />
                            <span>Gemini AI Demo</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Write Report Cards in <br />
                            <span className="text-emerald-green">Milliseconds</span>
                        </h2>
                        <p className="text-slate-400 mb-6">
                            Don&apos;t spend weeks writing remarks manually. Let our fine-tuned AI analyze student performance and generate personalized, empathetic comments instantly.
                        </p>
                        <ul className="space-y-2 text-sm text-slate-400 mb-8">
                            <li className="flex items-center gap-2"><CheckMark /> Context-aware analysis</li>
                            <li className="flex items-center gap-2"><CheckMark /> Tone adjustment (Encouraging/Stern)</li>
                            <li className="flex items-center gap-2"><CheckMark /> Zero spelling errors</li>
                        </ul>
                    </div>

                    <div className="w-full max-w-md mx-auto">
                        <Card className="bg-black/50 border-white/10 shadow-2xl backdrop-blur-md">
                            <CardContent className="p-6 space-y-6">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase">Input Student Score</label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={score}
                                            onChange={(e) => setScore(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-green"
                                        />
                                        <span className="text-2xl font-bold text-white w-12">{score}%</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={generateRemark}
                                    disabled={loading}
                                    className="w-full bg-neon-purple hover:bg-violet-600 text-white"
                                >
                                    {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Generate AI Remark
                                </Button>

                                <div className="bg-obsidian rounded-lg p-4 min-h-[100px] border border-white/5">
                                    <label className="text-xs font-medium text-slate-500 mb-1 block">AI Output:</label>
                                    {remark ? (
                                        <p className="text-slate-200 text-sm leading-relaxed animate-in fade-in">{remark}</p>
                                    ) : (
                                        <p className="text-slate-600 text-sm italic">Click generate to see magic happens...</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}

function CheckMark() {
    return <div className="h-4 w-4 rounded-full bg-emerald-green/20 flex items-center justify-center text-emerald-green text-[10px] font-bold">✓</div>
}
