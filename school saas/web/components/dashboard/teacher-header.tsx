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
        <div className="w-full bg-transparent p-0 text-white">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">Teacher Workspace</h1>
                    <p className="text-slate-400 mt-1">Manage your classes and lessons efficiently.</p>
                </div>
                <button
                    onClick={() => {
                        toast.info("Academic Setup", { description: "Opening Lesson Architect..." })
                        router.push('/dashboard/teacher/lesson-plans')
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-sm"
                >
                    Create Lesson
                </button>
            </div>

            {/* 🏛️ Active Class Command Card */}
            <div className="bg-[#0f172a]/80 border border-blue-500/30 rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.1)] relative group backdrop-blur-3xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />

                <div className="p-10 flex flex-col md:flex-row justify-between items-start relative z-10">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-400/20">
                                Current Session
                            </span>
                            {(startTime && endTime) && (
                                <span className="text-slate-400 text-[10px] font-mono flex items-center gap-1.5 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" /> {startTime} - {endTime}
                                </span>
                            )}
                        </div>
                        <h2 className="text-6xl font-black mt-6 tracking-tighter text-white">
                            {classData.name}
                        </h2>
                        <p className="text-slate-400 text-xl mt-3 font-medium">
                            {classData.grade_level} • {classData.subject || "Not Assigned"}
                            {classData.academic_session && ` • ${classData.academic_session}`}
                            {classData.term && ` • ${classData.term}${classData.term.toLowerCase().includes('term') ? '' : ' Term'}`}
                        </p>
                    </div>

                    <div className="flex gap-4 mt-8 md:mt-0">
                        <div className="bg-[#1e293b]/50 p-6 rounded-2xl text-center border border-white/10 w-32 shadow-2xl backdrop-blur-md">
                            <p className="text-4xl font-black text-white tracking-tighter">{vitals.present}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black mt-2 tracking-widest">Present</p>
                        </div>
                        <div className="bg-[#1e293b]/50 p-6 rounded-2xl text-center border border-white/10 w-32 shadow-2xl backdrop-blur-md">
                            <p className="text-4xl font-black text-slate-500 tracking-tighter">{vitals.absent}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black mt-2 tracking-widest">Absent</p>
                        </div>
                    </div>
                </div>

                {/* ⚡ Action Bar */}
                <div className="bg-[#0f172a] border-t border-white/5 p-8 flex flex-wrap gap-4 relative z-10">
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
                        className="flex items-center gap-2 bg-white/5 border border-white/10 px-8 py-3.5 rounded-xl font-black hover:bg-white/10 transition-colors active:scale-95 text-sm text-slate-200"
                    >
                        <FileText className="w-5 h-5" /> View Lesson Plan
                    </button>
                </div>
            </div>
        </div>
    )
}
