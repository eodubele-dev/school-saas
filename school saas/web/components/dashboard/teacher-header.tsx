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

            {/* 🏛️ Active Class Command Card */}
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 border border-blue-400/30 rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(37,99,235,0.5)] relative group text-white">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />

                <div className="p-10 flex flex-col md:flex-row justify-between items-start relative z-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-blue-100 bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-white/20 backdrop-blur-md">
                                Current Session
                            </span>
                            {(startTime && endTime) && (
                                <span className="text-blue-200 text-[10px] font-mono flex items-center gap-1.5 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" /> {startTime} - {endTime}
                                </span>
                            )}
                        </div>
                        <h2 className="text-6xl font-black mt-6 tracking-tighter text-white drop-shadow-md">
                            {classData.name}
                        </h2>
                        <p className="text-blue-100 text-xl mt-3 font-medium">
                            {classData.grade_level} • {classData.subject || "Not Assigned"}
                            {classData.academic_session && ` • ${classData.academic_session}`}
                            {classData.term && ` • ${classData.term}${classData.term.toLowerCase().includes('term') ? '' : ' Term'}`}
                        </p>
                    </div>

                    <div className="flex gap-4 mt-8 md:mt-0">
                        <div className="bg-emerald-500/20 p-6 rounded-2xl text-center border border-emerald-500/30 w-32 shadow-2xl backdrop-blur-md">
                            <p className="text-4xl font-black text-emerald-400 tracking-tighter">{vitals.present}</p>
                            <p className="text-[10px] text-emerald-200/70 uppercase font-black mt-2 tracking-widest">Present</p>
                        </div>
                        <div className="bg-orange-500/20 p-6 rounded-2xl text-center border border-orange-500/30 w-32 shadow-2xl backdrop-blur-md">
                            <p className="text-4xl font-black text-orange-400 tracking-tighter">{vitals.absent}</p>
                            <p className="text-[10px] text-orange-200/70 uppercase font-black mt-2 tracking-widest">Absent</p>
                        </div>
                    </div>
                </div>

                {/* ⚡ Action Bar */}
                <div className="bg-[#0f172a] border-t border-border/50 p-8 flex flex-wrap gap-4 relative z-10">
                    <button
                        onClick={handleStartClass}
                        className="flex items-center gap-2 bg-blue-600 px-8 py-3.5 rounded-xl font-black hover:bg-blue-500 transition-all shadow-[0_0_25px_rgba(37,99,235,0.4)] active:scale-95 text-sm"
                    >
                        <PlayCircle className="w-5 h-5 fill-white" /> Start Class
                    </button>
                    <button
                        onClick={() => {
                            toast.info("Resource Portal", { description: "Opening Lesson Plans..." })
                            router.push('/dashboard/teacher/lesson-plans')
                        }}
                        className="flex items-center gap-2 bg-secondary/50 border border-border px-8 py-3.5 rounded-xl font-black hover:bg-white/10 transition-colors active:scale-95 text-sm text-slate-200"
                    >
                        <FileText className="w-5 h-5" /> View Lesson Plan
                    </button>
                </div>
            </div>
        </div>
    )
}
