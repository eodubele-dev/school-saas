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
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Welcome back, {student?.full_name?.split(' ')[0]}! ✨
                    </h1>
                    <p className="text-muted-foreground">Your learning journey continues.</p>
                </div>

                <Button
                    onClick={handleDownload}
                    className={`${feesPaid ? 'bg-[var(--school-accent)]' : 'bg-slate-800 text-muted-foreground cursor-not-allowed'} hover:brightness-110 text-foreground font-medium`}
                >
                    {feesPaid ? <Download className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    {feesPaid ? "Download Result" : "Fees Unpaid"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Avg Score */}
                <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900 border-none shadow-[0_0_40px_rgba(37,99,235,0.15)] group hover:shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner border border-border">
                            <span className="text-2xl drop-shadow-md">📊</span>
                        </div>
                        <div>
                            <p className="text-xs text-blue-100 font-bold uppercase tracking-wider opacity-80">Average</p>
                            <p className="text-3xl font-black text-foreground drop-shadow-sm">{metrics.average}%</p>
                        </div>
                    </div>
                </Card>

                {/* 2. Class Rank */}
                <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-fuchsia-600 to-purple-900 border-none shadow-[0_0_40px_rgba(192,38,211,0.15)] group hover:shadow-[0_0_40px_rgba(192,38,211,0.3)] transition-all duration-500">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner border border-border">
                            <Trophy className="h-6 w-6 text-fuchsia-100 drop-shadow-md" />
                        </div>
                        <div>
                            <p className="text-xs text-fuchsia-100 font-bold uppercase tracking-wider opacity-80">Class Rank</p>
                            <p className="text-3xl font-black text-foreground drop-shadow-sm">
                                {metrics.rank > 0 ? metrics.rank : 'N/A'}
                                <span className="text-sm text-fuchsia-200/70 font-medium ml-1">of {metrics.totalStudents}</span>
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 3. Attendance */}
                <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-900 border-none shadow-[0_0_40px_rgba(16,185,129,0.15)] group hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-500">
                    <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -translate-y-1/2 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner border border-border">
                            <UserCheck className="h-6 w-6 text-emerald-100 drop-shadow-md" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider opacity-80">Attendance</p>
                            <p className="text-3xl font-black text-foreground drop-shadow-sm">{metrics.attendancePct}%</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
