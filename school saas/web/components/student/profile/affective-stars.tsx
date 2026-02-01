"use client"

import { Card } from "@/components/ui/card"
import { Star, Sparkles } from "lucide-react"

export function AffectiveStars({ behavior }: { behavior: any }) {
    if (!behavior) return null

    const traits = [
        { label: "Punctuality", score: behavior.punctuality || 0 },
        { label: "Neatness", score: behavior.neatness || 0 },
        { label: "Politeness", score: behavior.politeness || 0 },
        { label: "Cooperation", score: behavior.cooperation || 0 },
        { label: "Leadership", score: behavior.leadership || 0 },
        { label: "Attentiveness", score: behavior.attentiveness || 0 },
    ]

    return (
        <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
            <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h3 className="text-white font-bold">Affective Domain</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {traits.map((trait) => (
                    <div key={trait.label} className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm font-medium">{trait.label}</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-4 w-4 ${star <= trait.score
                                            ? "fill-cyan-400 text-cyan-400"
                                            : "fill-slate-800 text-slate-800"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {behavior.overall_remark && (
                <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Personality Summary</span>
                    </div>
                    <p className="text-slate-300 text-sm italic leading-relaxed">
                        "{behavior.overall_remark}"
                    </p>
                </div>
            )}
        </Card>
    )
}
