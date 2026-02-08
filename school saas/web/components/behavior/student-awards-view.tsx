
"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star, Medal, Crown, Sparkles } from "lucide-react"

// Map icon keys to Lucide icons
const ICONS: Record<string, any> = {
    star: Star,
    trophy: Trophy,
    medal: Medal,
    crown: Crown,
    sparkles: Sparkles
}

export function StudentAwardsView({ achievements }: { achievements: any[] }) {
    if (!achievements || achievements.length === 0) {
        return (
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-300">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Awards & Recognition
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-40 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                        <Trophy className="w-6 h-6 text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm">No awards received yet.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-300">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Awards & Recognition
                </CardTitle>
                <div className="text-xs font-mono text-slate-500">
                    TOTAL: <span className="text-white">{achievements.length}</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((award) => {
                        const Icon = ICONS[award.icon_key] || Trophy
                        return (
                            <div key={award.id} className="bg-slate-950/50 border border-white/5 rounded-xl p-4 flex items-start gap-3 group hover:border-yellow-500/30 transition-colors">
                                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20 group-hover:scale-110 transition-all">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200 text-sm">{award.title}</h4>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{award.comment}</p>
                                    <p className="text-[10px] text-slate-600 mt-2 font-mono">
                                        {new Date(award.awarded_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
