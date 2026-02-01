"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, Crown } from "lucide-react"
import { TeacherClass } from "@/lib/actions/classes"

interface ClassCardProps {
    classItem: TeacherClass
    onClick: () => void
    isSelected?: boolean
}

export function ClassCard({ classItem, onClick, isSelected }: ClassCardProps) {
    const isFormTeacher = classItem.role === 'form_teacher'

    return (
        <Card
            onClick={onClick}
            className={`
                cursor-pointer overflow-hidden transition-all duration-300 relative group
                ${isSelected
                    ? 'border-[var(--school-accent)] bg-[var(--school-accent)]/10 ring-1 ring-[var(--school-accent)]'
                    : 'border-white/10 bg-slate-900/50 hover:bg-slate-900 hover:border-white/20 hover:shadow-xl hover:translate-y-[-2px]'
                }
            `}
        >
            {/* Form Teacher Badge (Top Right) */}
            {isFormTeacher && (
                <div className="absolute top-0 right-0 p-2">
                    <div className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Crown className="h-3 w-3" /> Form Teacher
                    </div>
                </div>
            )}

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isSelected ? 'bg-[var(--school-accent)] text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-[var(--school-accent)] group-hover:text-white transition-colors'}`}>
                        <GraduationCap className="h-6 w-6" />
                    </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-[var(--school-accent)] transition-colors">{classItem.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{classItem.grade_level} • {isFormTeacher ? 'Class Manager' : classItem.subject}</p>

                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950/30 p-2 rounded w-fit">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold text-slate-300">{classItem.student_count}</span>
                    <span>students</span>
                </div>
            </div>

            {/* Active Glow Bar */}
            {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--school-accent)] shadow-[0_-2px_10px_var(--school-accent)]" />
            )}
        </Card>
    )
}
