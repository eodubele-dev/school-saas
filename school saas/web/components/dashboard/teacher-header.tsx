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

            {/* 🏛️ Unified Midnight Glass Command Card */}
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#0f172a]/80 border border-white/5 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/10">
                {/* 🌈 Thick Top Accent Border */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600 shadow-[0_4px_20px_rgba(37,99,235,0.4)]" />
                
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700" />

                <div className="relative z-10">
                    <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-10">
                        {/* Class Identity */}
                        <div className="flex-1 text-center md:text-left space-y-6">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
                                    Active Session
                                </span>
                                {(startTime && endTime) && (
                                    <span className="inline-flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">
                                        <Clock className="w-3.5 h-3.5 text-blue-400" /> {startTime} — {endTime}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
                                    {classData.name}
                                </h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-muted-foreground text-lg md:text-xl font-medium">
                                    <span className="text-blue-200/80">{classData.grade_level}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                    <span className="text-white/90">{classData.subject || "No Subject"}</span>
                                    <span className="hidden md:inline w-1.5 h-1.5 rounded-full bg-slate-800" />
                                    <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-1 rounded-xl border border-blue-500/20">
                                        <span className="text-blue-400 text-[10px] font-black uppercase tracking-tight">Current Term:</span>
                                        <span className="text-white text-xs font-black">{classData.term || "3rd"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Quick Vitals */}
                        <div className="flex gap-6">
                            <div className="relative group/stat">
                                <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                                <div className="relative flex flex-col items-center justify-center w-32 h-32 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm transition-transform group-hover/stat:scale-105">
                                    <span className="text-5xl font-black text-emerald-400 tracking-tighter">{vitals.present}</span>
                                    <span className="text-[10px] text-emerald-300/40 uppercase font-black mt-2 tracking-[0.2em]">Present</span>
                                </div>
                            </div>
                            <div className="relative group/stat">
                                <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                                <div className="relative flex flex-col items-center justify-center w-32 h-32 rounded-[2rem] bg-orange-500/5 border border-orange-500/20 backdrop-blur-sm transition-transform group-hover/stat:scale-105">
                                    <span className="text-5xl font-black text-orange-400 tracking-tighter">{vitals.absent}</span>
                                    <span className="text-[10px] text-orange-300/40 uppercase font-black mt-2 tracking-[0.2em]">Absent</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ⚡ Integrated Glass Action Bar */}
                    <div className="px-8 pb-10 flex flex-wrap justify-center md:justify-start gap-4">
                        <button
                            onClick={handleStartClass}
                            className="group relative flex items-center gap-3 bg-blue-600 px-10 py-4 rounded-2xl font-black text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-blue-500 shadow-[0_15px_40px_-10px_rgba(37,99,235,0.5)] active:scale-95"
                        >
                            <PlayCircle className="w-5 h-5 fill-white" />
                            <span className="text-xs uppercase tracking-[0.1em]">Begin Session</span>
                        </button>

                        <button
                            onClick={() => {
                                toast.info("Resource Portal", { description: "Opening Lesson Plans..." })
                                router.push('/dashboard/teacher/lesson-plans')
                            }}
                            className="flex items-center gap-3 bg-white/5 border border-white/10 px-10 py-4 rounded-2xl font-black text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-95 group"
                        >
                            <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                            <span className="text-xs uppercase tracking-[0.1em]">Lesson Repository</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
