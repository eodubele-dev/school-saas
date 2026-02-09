"use client"

import { Card } from "@/components/ui/card"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { BrainCircuit } from "lucide-react"

export function CharacterRadar({ behavior }: { behavior: any }) {

    const data = [
        { subject: 'Punctuality', A: behavior.punctuality, fullMark: 5 },
        { subject: 'Neatness', A: behavior.neatness, fullMark: 5 },
        { subject: 'Politeness', A: behavior.politeness, fullMark: 5 },
        { subject: 'Cooperation', A: behavior.cooperation, fullMark: 5 },
        { subject: 'Leadership', A: behavior.leadership, fullMark: 5 },
        { subject: 'Attentiveness', A: behavior.attentiveness, fullMark: 5 },
    ]

    return (
        <Card className="p-6 bg-slate-900 border-white/5 h-full">
            <div className="mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-[var(--school-accent)]" />
                    Character Radar
                </h3>
                <p className="text-sm text-slate-400">Behavioral Assessment (Scale 1-5)</p>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                        <Radar
                            name="Student"
                            dataKey="A"
                            stroke="var(--school-accent)"
                            fill="var(--school-accent)"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
