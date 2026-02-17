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
                <div className="h-64 bg-slate-900/50 rounded-3xl" />
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="h-32 bg-slate-900/50 rounded-xl" />
                    <div className="h-32 bg-slate-900/50 rounded-xl" />
                    <div className="h-32 bg-slate-900/50 rounded-xl" />
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
        <div className="space-y-8 animate-in fade-in duration-500">
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
                />
                <MetricCard
                    title="Upcoming Exams"
                    value={metrics.upcomingExams.toString()}
                    icon={Calendar}
                    description="Active Assessments"
                />
                <MetricCard
                    title="Avg. Attendance"
                    value={`${vitals.avgAttendance}%`}
                    icon={UserCheck}
                    description="Class Average"
                />
            </div>


            {/* 📖 Academic Resources & Schedule */}
            <div className="grid gap-6">
                <Card className="bg-[#0f172a]/80 border-white/10 backdrop-blur-xl shadow-lg group rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                            Upcoming Lessons
                        </CardTitle>
                        <span className="text-[10px] text-blue-400 bg-blue-400/5 px-2 py-1 rounded-full uppercase font-mono border border-blue-400/10">
                            Sync: Stable
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingLessons.length > 0 ? upcomingLessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className="flex items-center gap-4 group/item p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10 cursor-pointer"
                                >
                                    <div className="w-1.5 h-12 bg-blue-500 rounded-full group-hover/item:bg-blue-400 transition-all group-hover/item:shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-100 group-hover/item:text-blue-400 transition-colors">{lesson.title}</p>
                                        <p className="text-sm text-slate-500 font-medium">{lesson.subject} • {new Date(lesson.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                toast.info("Opening Lesson", { description: lesson.title })
                                                router.push('/dashboard/teacher/lesson-plans')
                                            }}
                                            className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-500/20 uppercase tracking-wider"
                                        >
                                            Manage Lessons
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
                                    <p className="text-sm text-slate-500 font-medium italic">No upcoming lessons scheduled.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
