"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, UserCheck, Clock } from "lucide-react"
import { useTeacherData } from "@/hooks/use-teacher-data"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MetricCard } from "./metric-card"
import { TeacherHeader } from "./teacher-header"
import { Skeleton } from "@/components/ui/skeleton"

export function TeacherDashboard({ tier = 'starter' }: { tier?: string }) {
    const { data, loading, error } = useTeacherData(30000) // Poll every 30s for attendance vitals
    const router = useRouter()

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-64 bg-card text-card-foreground/50 rounded-3xl" />
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="h-32 bg-card text-card-foreground/50 rounded-xl" />
                    <div className="h-32 bg-card text-card-foreground/50 rounded-xl" />
                    <div className="h-32 bg-card text-card-foreground/50 rounded-xl" />
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-mono">
                [SYSTEM_ERROR]: Failed to synchronize workspace data. {error}
            </div>
        )
    }

    const { profile, activeClass, vitals, metrics, upcomingLessons } = data

    return (
        <div className="relative min-h-screen space-y-10 animate-in fade-in duration-700 pb-20">
            {/* 🪐 Immersive Ambient Backgrounds */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px]" />
            </div>
            {/* 🛡️ Integrated Workspace Header & Active Class */}
            <TeacherHeader
                classData={activeClass}
                vitals={vitals}
                teacherId={profile?.id}
                tenantId={profile?.tenant_id}
            />

            {/* 📊 Real-Time Vitals / Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                    title="Assignments"
                    value={metrics.pendingAssignments.toString()}
                    icon={BookOpen}
                    description="Pending Grading"
                    accentColor="rose"
                />
                <MetricCard
                    title="Upcoming Exams"
                    value={metrics.upcomingExams.toString()}
                    icon={Calendar}
                    description="Active Assessments"
                    accentColor="amber"
                />
                <MetricCard
                    title="Avg. Attendance"
                    value={`${vitals.avgAttendance}%`}
                    icon={UserCheck}
                    description="Class Average"
                    accentColor="emerald"
                />
            </div>


            {/* 📖 Academic Resources & Schedule */}
            <div className="grid gap-6">
                <Card className="bg-[#0a0f1e]/60 border-white/5 backdrop-blur-3xl shadow-2xl group rounded-[2.5rem] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                    
                    <CardHeader className="flex flex-row items-center justify-between p-8 md:p-10 pb-2 relative z-10">
                        <CardTitle className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] font-mono">
                            Upcoming Lessons
                        </CardTitle>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Real-time Sync</span>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 md:p-10 pt-4 relative z-10">
                        <div className="space-y-4">
                            {upcomingLessons.length > 0 ? upcomingLessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className="flex items-center gap-6 group/item p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="w-2 h-14 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full group-hover/item:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all"></div>
                                    <div className="flex-1">
                                        <p className="text-lg font-black text-white group-hover/item:text-blue-400 transition-colors tracking-tight">{lesson.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-slate-400 font-semibold text-sm">
                                            <span className="text-blue-400/80">{lesson.subject}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-800" />
                                            <span>{new Date(lesson.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover/item:opacity-100 translate-x-4 group-hover/item:translate-x-0 transition-all duration-300">
                                        <button
                                            onClick={() => {
                                                toast.info("Opening Lesson", { description: lesson.title })
                                                router.push('/dashboard/teacher/lesson-plans')
                                            }}
                                            className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                                        >
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-20 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.01]">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BookOpen className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 font-bold tracking-tight">No upcoming lessons scheduled.</p>
                                    <p className="text-slate-600 text-xs mt-1">Check back later for your academic schedule.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
