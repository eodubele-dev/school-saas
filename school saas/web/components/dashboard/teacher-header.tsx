"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, PlayCircle, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface TeacherHeaderProps {
    classData: {
        name: string
        grade_level: string
        subject?: string
        start_time?: string
        end_time?: string
        academic_session?: string
        term?: string
    }
    vitals: {
        present: number
        absent: number
    }
    teacherId: string
    tenantId: string
}

export const TeacherHeader = ({ classData, vitals, teacherId, tenantId }: TeacherHeaderProps) => {
    const supabase = createClient()
    const router = useRouter()

    // Helper to format HH:mm:ss to HH:mm AM/PM
    const formatTime = (timeStr?: string) => {
        if (!timeStr) return null
        try {
            const [hours, minutes] = timeStr.split(':')
            const h = parseInt(hours)
            const ampm = h >= 12 ? 'PM' : 'AM'
            const formattedH = h % 12 || 12
            return `${formattedH}:${minutes} ${ampm}`
        } catch (e) {
            return timeStr
        }
    }

    const startTime = formatTime(classData.start_time)
    const endTime = formatTime(classData.end_time)

    const handleStartClass = async () => {
        // 🛡️ Forensic Audit Trigger
        console.log("CLASS_START_LOGGED:", classData.name)

        try {
            const { error } = await supabase
                .from('audit_logs')
                .insert({
                    tenant_id: tenantId,
                    actor_id: teacherId,
                    action: 'CLASS_START',
                    category: 'Academic',
                    entity_type: 'class',
                    details: `CLASS_START: ${classData.name} // Teacher: ${teacherId}`,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        className: classData.name,
                        gradeLevel: classData.grade_level
                    }
                })

            if (error) throw error

            toast.success(`Class started: ${classData.name}`, {
                description: "Forensic audit log generated."
            })

            // Navigate to Live Attendance View
            router.push('/dashboard/attendance')
        } catch (error) {
            console.error("Failed to log class start:", error)
            toast.error("Audit log failure", {
                description: "Could not record class start event."
            })
        }
    }

    return (
        <div className="w-full bg-transparent p-0 text-foreground">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Teacher Workspace</h1>
                    <p className="text-muted-foreground mt-1">Manage your classes and lessons efficiently.</p>
                </div>
                <button
                    onClick={() => {
                        toast.info("Academic Setup", { description: "Opening Lesson Architect..." })
                        router.push('/dashboard/teacher/lesson-plans')
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-foreground px-6 py-2.5 rounded-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-sm"
                >
                    Create Lesson
                </button>
            </div>

            {/* 🏛️ Modern Premium Command Card */}
            <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_-20px_rgba(37,99,235,0.3)] transition-all duration-500 hover:shadow-[0_40px_120px_-20px_rgba(37,99,235,0.4)]">
                {/* 🎨 Background Mesh Layer */}
                <div className="absolute inset-0 bg-[#0a0f1e]" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-900/40 to-slate-950" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -ml-24 -mb-24 pointer-events-none" />

                <div className="relative z-10">
                    <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Class Identity */}
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    Active Session
                                </span>
                                {(startTime && endTime) && (
                                    <span className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-medium uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5" /> {startTime} — {endTime}
                                    </span>
                                )}
                            </div>

                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
                                {classData.name}
                            </h2>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-indigo-200/80 text-lg md:text-xl font-medium">
                                <span>{classData.grade_level}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span>{classData.subject || "No Subject"}</span>
                                <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-700" />
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-tight">Term:</span>
                                    <span className="text-white text-xs font-black">{classData.term || "3rd"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Vitals Hub */}
                        <div className="flex gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                            <div className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-transparent border-t border-emerald-500/30">
                                <span className="text-4xl font-black text-emerald-400 tracking-tighter leading-none">{vitals.present}</span>
                                <span className="text-[9px] text-emerald-300/60 uppercase font-black mt-2 tracking-[0.15em]">Present</span>
                            </div>
                            <div className="flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-gradient-to-b from-orange-500/20 to-transparent border-t border-orange-500/30">
                                <span className="text-4xl font-black text-orange-400 tracking-tighter leading-none">{vitals.absent}</span>
                                <span className="text-[9px] text-orange-300/60 uppercase font-black mt-2 tracking-[0.15em]">Absent</span>
                            </div>
                        </div>
                    </div>

                    {/* ⚡ Glass Action Bar */}
                    <div className="bg-white/[0.03] border-t border-white/10 p-6 md:p-8 flex flex-wrap justify-center md:justify-start gap-4 backdrop-blur-md">
                        <button
                            onClick={handleStartClass}
                            className="group relative flex items-center gap-3 bg-blue-600 px-10 py-4 rounded-2xl font-black text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_15px_30px_-10px_rgba(37,99,235,0.6)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                            <PlayCircle className="w-5 h-5 fill-white" />
                            <span className="relative text-sm uppercase tracking-wider">Start Class</span>
                        </button>

                        <button
                            onClick={() => {
                                toast.info("Resource Portal", { description: "Opening Lesson Plans..." })
                                router.push('/dashboard/teacher/lesson-plans')
                            }}
                            className="flex items-center gap-3 bg-white/5 border border-white/10 px-10 py-4 rounded-2xl font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-95 group"
                        >
                            <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-sm uppercase tracking-wider">Lesson Plan</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
