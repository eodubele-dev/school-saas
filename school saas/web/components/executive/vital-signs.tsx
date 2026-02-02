'use client'

import { Card } from "@/components/ui/card"
import { NairaIcon } from "@/components/ui/naira-icon"
import { Users, GraduationCap, ArrowUpRight, Activity } from "lucide-react"

interface VitalSignsProps {
    stats: {
        revenue: { todayCollected: number; totalCollected: number }
        attendance: { staffPresent: number; staffTotal: number; studentsAbsent: number }
    }
}

export function VitalSignsHUD({ stats }: VitalSignsProps) {
    return (
        <div className="grid grid-cols-3 gap-3">
            {/* Cash Position */}
            <Card className="bg-slate-900/50 border-amber-500/20 p-3 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 bg-amber-500/10 h-16 w-16 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <NairaIcon className="h-3 w-3 text-amber-500" /> Cash
                </div>
                <div>
                    <div className="text-lg font-bold text-white tracking-tight">
                        ₦{(stats.revenue.todayCollected / 1000).toFixed(1)}k
                    </div>
                    <div className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                        <ArrowUpRight className="h-2 w-2" /> Today
                    </div>
                </div>
            </Card>

            {/* Operations */}
            <Card className="bg-slate-900/50 border-blue-500/20 p-3 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 bg-blue-500/10 h-16 w-16 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Users className="h-3 w-3 text-blue-500" /> Staff
                </div>
                <div>
                    <div className="text-lg font-bold text-white tracking-tight">
                        {stats.attendance.staffPresent}<span className="text-slate-600 text-sm">/{stats.attendance.staffTotal}</span>
                    </div>
                    <div className="text-[9px] text-blue-400">
                        On Campus
                    </div>
                </div>
            </Card>

            {/* Student Safety */}
            <Card className="bg-slate-900/50 border-red-500/20 p-3 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 bg-red-500/10 h-16 w-16 rounded-full blur-xl group-hover:bg-red-500/20 transition-all" />
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 flex items-center gap-1">
                    <Activity className="h-3 w-3 text-red-500" /> Absent
                </div>
                <div>
                    <div className="text-lg font-bold text-white tracking-tight">
                        {stats.attendance.studentsAbsent}
                    </div>
                    <div className="text-[9px] text-red-400">
                        Detailed View
                    </div>
                </div>
            </Card>
        </div>
    )
}
