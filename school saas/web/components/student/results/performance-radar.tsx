"use client"

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"

export function PerformanceRadar({ grades }: { grades: any[] }) {
    // Transform grades into Radar Data
    // We'll group subjects or just pick top 5 for visual appeal
    // Ideally we want broad categories: "Numeracy", "Literacy", "Science", "Arts", "Social"
    // Since we just have raw subjects, let's map them or take first 5

    const data = grades.slice(0, 6).map(g => ({
        subject: g.subject?.name?.substring(0, 3)?.toUpperCase() || "SUB",
        fullMark: 100,
        A: Number(g.total) || 0
    }))

    // Fallback data if no grades
    const chartData = data.length > 0 ? data : [
        { subject: 'MTH', A: 0, fullMark: 100 },
        { subject: 'ENG', A: 0, fullMark: 100 },
        { subject: 'SCI', A: 0, fullMark: 100 },
        { subject: 'ART', A: 0, fullMark: 100 },
        { subject: 'SOC', A: 0, fullMark: 100 },
    ]

    return (
        <Card className="h-full p-6 bg-slate-900 border-white/5 flex flex-col items-center justify-center">
            <h3 className="text-white font-bold mb-4 w-full text-left">Cognitive Profile</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
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
            <p className="text-xs text-center text-slate-500 mt-2">
                Performance across key subjects
            </p>
        </Card>
    )
}
