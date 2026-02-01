"use client"

import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, TrendingDown, Users } from "lucide-react"

interface AnalyticsHeaderProps {
    grades: any[]
}

export function AnalyticsHeader({ grades }: AnalyticsHeaderProps) {
    if (!grades || grades.length === 0) return null

    const validGrades = grades.filter(g => g.total > 0)
    const totalStudents = grades.length
    const avgScore = validGrades.reduce((sum, g) => sum + g.total, 0) / (validGrades.length || 1)
    const highest = Math.max(...grades.map(g => g.total))
    const lowest = Math.min(...grades.map(g => g.total))
    const passCount = grades.filter(g => g.total >= 50).length
    const passRate = (passCount / totalStudents) * 100

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
                label="Class Average"
                value={`${avgScore.toFixed(1)}%`}
                icon={BarChart3}
                color="text-blue-400"
                bg="bg-blue-500/10"
            />
            <StatCard
                label="Highest Score"
                value={`${highest}%`}
                icon={TrendingUp}
                color="text-emerald-400"
                bg="bg-emerald-500/10"
            />
            <StatCard
                label="Lowest Score"
                value={`${lowest}%`}
                icon={TrendingDown}
                color="text-red-400"
                bg="bg-red-500/10"
            />
            <StatCard
                label="Pass Rate"
                value={`${passRate.toFixed(0)}%`}
                icon={Users}
                color="text-amber-400"
                bg="bg-amber-500/10"
            />
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
    return (
        <Card className={`p-4 border border-white/5 flex items-center justify-between ${bg}`}>
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">{label}</p>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
            </div>
            <div className={`p-2 rounded-full bg-white/5 ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
        </Card>
    )
}
