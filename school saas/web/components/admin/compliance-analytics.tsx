"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, AlertTriangle, CheckCircle2 } from "lucide-react"

export function ComplianceAnalytics() {
    // Mock Data for MVP
    const stats = {
        submissionRate: 78,
        laggingStaff: 3,
        totalStaff: 24
    }

    return (
        <div className="flex gap-4">
            <Card className="bg-slate-900/50 border-white/10 p-3 px-4 flex items-center gap-4 min-w-[200px]">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                    <h4 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Submission Rate</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{stats.submissionRate}%</span>
                        <Progress value={stats.submissionRate} className="h-1.5 w-16 bg-slate-800" indicatorClassName="bg-blue-500" />
                    </div>
                </div>
            </Card>

            <Card className="bg-slate-900/50 border-white/10 p-3 px-4 flex items-center gap-4 min-w-[200px]">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                    <h4 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lagging Teachers</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{stats.laggingStaff}</span>
                        <span className="text-xs text-slate-500">/ {stats.totalStaff}</span>
                    </div>
                </div>
            </Card>
        </div>
    )
}
