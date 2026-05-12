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

            <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_40px_120px_-30px_rgba(37,99,235,0.4)] transition-all duration-700">
                {/* 🎨 Liquid Mesh Background */}
                <div className="absolute inset-0 bg-[#060a16]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),_transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.1),_transparent)]" />
                
                {/* 💫 Animated Orbs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] -mr-48 -mt-48 animate-pulse pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -ml-24 -mb-24 pointer-events-none" />

                <div className="relative z-10">
                    <div className="p-10 md:p-14 flex flex-col md:flex-row justify-between items-center gap-12">
                        {/* Class Identity */}
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-ping" />
                                    Live Session
                                </div>
                                {(startTime && endTime) && (
                                    <div className="inline-flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                        <Clock className="w-3.5 h-3.5 text-blue-400" /> {startTime} — {endTime}
                                    </div>
                                )}
                            </div>

                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                                {classData.name}
                            </h2>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-300 text-xl md:text-2xl font-semibold">
                                <span className="text-blue-400/90">{classData.grade_level}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                <span className="text-white/90">{classData.subject || "No Subject"}</span>
                                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 px-4 py-1.5 rounded-xl border border-white/10 backdrop-blur-md ml-2">
                                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Term</span>
                                    <span className="text-white text-sm font-black">{classData.term || "3rd"}</span>
                                </div>
                            </div>
                        </div>

                        {/* ⚡ High-Saturation Attendance Vitals */}
                        <div className="flex gap-6 p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-2xl shadow-2xl relative group/vitals">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover/vitals:opacity-100 transition-opacity rounded-[2.5rem]" />
                            
                            <div className="flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)] group/present hover:scale-105 transition-transform duration-500">
                                <span className="text-5xl font-black text-emerald-400 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">{vitals.present}</span>
                                <span className="text-[10px] text-emerald-300 font-black mt-3 uppercase tracking-[0.2em]">Present</span>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-transparent border border-orange-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)] group/absent hover:scale-105 transition-transform duration-500">
                                <span className="text-5xl font-black text-orange-400 tracking-tighter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">{vitals.absent}</span>
                                <span className="text-[10px] text-orange-300 font-black mt-3 uppercase tracking-[0.2em]">Absent</span>
                            </div>
                        </div>
                    </div>

                    {/* ⚡ Glass Action Hub */}
                    <div className="bg-white/[0.02] border-t border-white/10 p-8 md:p-10 flex flex-wrap justify-center md:justify-start gap-6 backdrop-blur-3xl">
                        <button
                            onClick={handleStartClass}
                            className="group relative flex items-center gap-4 bg-blue-600 px-12 py-5 rounded-[1.5rem] font-black text-white overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.7)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            <PlayCircle className="w-6 h-6 fill-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                            <span className="relative text-sm uppercase tracking-[0.15em]">Start Class</span>
                        </button>

                        <button
                            onClick={() => {
                                toast.info("Resource Portal", { description: "Opening Lesson Plans..." })
                                router.push('/dashboard/teacher/lesson-plans')
                            }}
                            className="flex items-center gap-4 bg-white/5 border border-white/10 px-12 py-5 rounded-[1.5rem] font-black text-slate-200 hover:bg-white/10 hover:text-white transition-all duration-500 hover:border-white/20 active:scale-95 group"
                        >
                            <FileText className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-sm uppercase tracking-[0.15em]">Lesson Plans</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}
