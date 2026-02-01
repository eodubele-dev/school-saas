"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Trophy, UserCheck, Lock } from "lucide-react"
import { toast } from "sonner"
import { NairaIcon } from "@/components/ui/naira-icon"

export function DashboardHeader({ student, metrics, feesPaid }: { student: any, metrics: any, feesPaid: boolean }) {

    const handleDownload = () => {
        if (!feesPaid) {
            toast.error("Access Restricted: Outstanding Fees Detected.")
            return
        }
        toast.success("Downloading Term Result...")
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Welcome back, {student?.full_name?.split(' ')[0]}! ✨
                    </h1>
                    <p className="text-slate-400">Your learning journey continues.</p>
                </div>

                <Button
                    onClick={handleDownload}
                    className={`${feesPaid ? 'bg-[var(--school-accent)]' : 'bg-slate-800 text-slate-400 cursor-not-allowed'} hover:brightness-110 text-white font-medium`}
                >
                    {feesPaid ? <Download className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    {feesPaid ? "Download Result" : "Fees Unpaid"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Avg Score */}
                <Card className="p-4 bg-gradient-to-br from-blue-900/50 to-slate-900 border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📊</span>
                        </div>
                        <div>
                            <p className="text-xs text-blue-200 font-bold uppercase">Average</p>
                            <p className="text-2xl font-bold text-white">{metrics.average}%</p>
                        </div>
                    </div>
                </Card>

                {/* 2. Class Rank */}
                <Card className="p-4 bg-gradient-to-br from-purple-900/50 to-slate-900 border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-purple-200 font-bold uppercase">Class Rank</p>
                            <p className="text-2xl font-bold text-white">{metrics.rank} <span className="text-sm text-slate-400 font-normal">of {metrics.totalStudents}</span></p>
                        </div>
                    </div>
                </Card>

                {/* 3. Attendance */}
                <Card className="p-4 bg-gradient-to-br from-emerald-900/50 to-slate-900 border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-200 font-bold uppercase">Attendance</p>
                            <p className="text-2xl font-bold text-white">{metrics.attendancePct}%</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
