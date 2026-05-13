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
        try {
            const { error } = await supabase
                .from('audit_logs')
                .insert({
                    tenant_id: tenantId,
                    actor_id: teacherId,
                    action: 'CLASS_START',
                    category: 'Academic',
                    entity_type: 'class',
                    details: `CLASS_START: ${classData.name}`,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        className: classData.name
                    }
                })

            if (error) throw error
            toast.success(`Class started: ${classData.name}`)
            router.push('/dashboard/attendance')
        } catch (error) {
            toast.error("Failed to record class start")
        }
    }

    return (
        <div className="w-full space-y-6">
            {/* 🏷️ Minimalist Header Row */}
            {/* 🏷️ Minimalist Header Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-2 border-b border-white/5">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        Teacher Workspace
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider opacity-60 mt-1">
                        Academic Command Center
                    </p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/teacher/lesson-plans')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors px-4 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10 w-full sm:w-auto justify-center sm:justify-start"
                >
                    <FileText className="w-3 h-3" />
                    Create Lesson
                </button>
            </div>

            {/* 🏛️ Subtle Active Session Bar */}
            <div className="bg-[#0f172a]/60 border border-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all hover:border-white/10 shadow-sm">
                <div className="flex items-center gap-4 sm:gap-5 w-full">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 border border-white/5">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate">{classData.name}</h2>
                            <span className="text-[10px] text-slate-500 font-mono">/ {classData.grade_level}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                            <span>{classData.subject || "No Subject"}</span>
                            <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-800" />
                            <span>{classData.term || "3rd Term"}</span>
                            {startTime && (
                                <>
                                    <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-800" />
                                    <span className="text-slate-600">{startTime} — {endTime}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    {/* Compact Attendance Vitals */}
                    <div className="flex gap-1.5 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 w-full sm:w-auto justify-around sm:justify-start">
                        <div className="text-center px-3">
                            <p className="text-sm font-black text-emerald-400 leading-none">{vitals.present}</p>
                            <p className="text-[8px] text-slate-600 uppercase font-bold mt-1">Present</p>
                        </div>
                        <div className="w-[1px] h-6 bg-white/5 self-center" />
                        <div className="text-center px-3">
                            <p className="text-sm font-black text-orange-400 leading-none">{vitals.absent}</p>
                            <p className="text-[8px] text-slate-600 uppercase font-bold mt-1">Absent</p>
                        </div>
                    </div>

                    <button
                        onClick={handleStartClass}
                        className="w-full lg:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                    >
                        <PlayCircle className="w-4 h-4 fill-white" />
                        Start Session
                    </button>
                </div>
            </div>
        </div>
    )
}
