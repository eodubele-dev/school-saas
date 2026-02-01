"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Lock, Save, AlertCircle } from "lucide-react"
import { upsertGrade, lockClassGrades, GradeEntry } from "@/lib/actions/gradebook"
import { RemarkGenerator } from "./remark-generator"
import { AnalyticsHeader } from "./analytics-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Debounce helper
function useDebounce(effect: Function, dependencies: any[], delay: number) {
    const callback = useCallback(effect, dependencies);

    useEffect(() => {
        const timeout = setTimeout(callback, delay);
        return () => clearTimeout(timeout);
    }, [callback, delay]);
}

interface GradeEntryGridProps {
    initialGrades: GradeEntry[]
    classId: string
    subjectId: string
}

export function GradeEntryGrid({ initialGrades, classId, subjectId }: GradeEntryGridProps) {
    const [grades, setGrades] = useState<GradeEntry[]>(initialGrades)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [isLocked, setIsLocked] = useState(initialGrades[0]?.is_locked || false)
    const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set())

    // Handler for cell updates
    const handleChange = (studentId: string, field: keyof GradeEntry, value: any) => {
        if (isLocked) return

        setGrades(prev => prev.map(g => {
            if (g.student_id === studentId) {
                const updated = { ...g, [field]: value }

                // Auto-calc total & grade logic on frontend for instant feedback
                if (['ca1', 'ca2', 'exam'].includes(field as string)) {
                    const total = (Number(updated.ca1) || 0) + (Number(updated.ca2) || 0) + (Number(updated.exam) || 0)
                    updated.total = total

                    if (total >= 70) updated.grade = 'A'
                    else if (total >= 60) updated.grade = 'B'
                    else if (total >= 50) updated.grade = 'C'
                    else if (total >= 45) updated.grade = 'D'
                    else if (total >= 40) updated.grade = 'E'
                    else updated.grade = 'F'
                }

                // Queue for save
                setPendingUpdates(prev => new Set(prev).add(studentId))
                return updated
            }
            return g
        }))
    }

    // Effect to auto-save pending updates (Debounced)
    useDebounce(async () => {
        if (pendingUpdates.size === 0) return

        const toSave = Array.from(pendingUpdates)
        setPendingUpdates(new Set()) // Clear queue immediately to avoid double save loop

        for (const studentId of toSave) {
            const entry = grades.find(g => g.student_id === studentId)
            if (entry) {
                setSavingId(studentId)
                await upsertGrade(entry)
                setSavingId(null)
            }
        }
    }, [grades, pendingUpdates], 1000)

    const handleLock = async () => {
        if (!confirm("Are you sure? This will lock grades for Admin review.")) return

        const res = await lockClassGrades(classId, subjectId, '1st', '2023/2024')
        if (res.success) {
            setIsLocked(true)
            toast.success("Grades locked successfully")
        } else {
            toast.error("Failed to lock grades")
        }
    }

    return (
        <div className="space-y-6">
            <AnalyticsHeader grades={grades} />

            <div className="flex justify-between items-center bg-slate-900 p-4 border border-white/5 rounded-t-lg">
                <h3 className="text-lg font-bold text-white">Student Scores</h3>
                {isLocked ? (
                    <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm font-medium">Locked for Approval</span>
                    </div>
                ) : (
                    <Button onClick={handleLock} variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10">
                        <Lock className="h-4 w-4 mr-2" /> Lock Scores
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-b-lg bg-slate-900">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950">
                        <tr>
                            <th className="px-4 py-3 sticky left-0 bg-slate-950 z-10 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">Student Name</th>
                            <th className="px-2 py-3 w-20 text-center">CA 1 (20)</th>
                            <th className="px-2 py-3 w-20 text-center">CA 2 (20)</th>
                            <th className="px-2 py-3 w-20 text-center">Exam (60)</th>
                            <th className="px-2 py-3 w-20 text-center">Total</th>
                            <th className="px-2 py-3 w-16 text-center">Grade</th>
                            <th className="px-4 py-3 min-w-[300px]">Remarks</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {grades.map((grade) => (
                            <tr key={grade.student_id} className={cn("hover:bg-white/[0.02] group", isLocked && "opacity-70 pointer-events-none")}>
                                <td className="px-4 py-2 font-medium text-slate-200 sticky left-0 bg-slate-900 group-hover:bg-slate-800/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] transition-colors">
                                    {grade.student_name}
                                    {savingId === grade.student_id && <Loader2 className="h-3 w-3 animate-spin inline-block ml-2 text-slate-500" />}
                                </td>

                                {/* Inputs with Validation Glow */}
                                <td className="px-2 py-2">
                                    <Input
                                        type="number"
                                        value={grade.ca1}
                                        onChange={(e) => handleChange(grade.student_id, 'ca1', e.target.value)}
                                        className={cn(
                                            "bg-transparent border-transparent hover:border-white/10 focus:bg-slate-950 focus:border-[var(--school-accent)] text-center h-8",
                                            grade.ca1 > 20 && "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] text-red-500"
                                        )}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <Input
                                        type="number"
                                        value={grade.ca2}
                                        onChange={(e) => handleChange(grade.student_id, 'ca2', e.target.value)}
                                        className={cn(
                                            "bg-transparent border-transparent hover:border-white/10 focus:bg-slate-950 focus:border-[var(--school-accent)] text-center h-8",
                                            grade.ca2 > 20 && "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] text-red-500"
                                        )}
                                    />
                                </td>
                                <td className="px-2 py-2">
                                    <Input
                                        type="number"
                                        value={grade.exam}
                                        onChange={(e) => handleChange(grade.student_id, 'exam', e.target.value)}
                                        className={cn(
                                            "bg-transparent border-transparent hover:border-white/10 focus:bg-slate-950 focus:border-[var(--school-accent)] text-center h-8",
                                            grade.exam > 60 && "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] text-red-500"
                                        )}
                                    />
                                </td>

                                <td className="px-2 py-2 text-center font-bold text-slate-300">
                                    {grade.total}
                                </td>
                                <td className={cn("px-2 py-2 text-center font-bold",
                                    grade.grade === 'A' ? "text-emerald-400" :
                                        grade.grade === 'F' ? "text-red-400" : "text-amber-400"
                                )}>
                                    {grade.grade}
                                </td>

                                <td className="px-4 py-2 relative">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={grade.remarks}
                                            onChange={(e) => handleChange(grade.student_id, 'remarks', e.target.value)}
                                            className="bg-transparent border-transparent hover:border-white/10 focus:bg-slate-950 focus:border-[var(--school-accent)] h-8 text-xs flex-1"
                                            placeholder="Enter remark..."
                                        />
                                        {!isLocked && (
                                            <RemarkGenerator
                                                studentName={grade.student_name}
                                                scores={grade}
                                                currentRemark={grade.remarks}
                                                onUpdate={(rem) => handleChange(grade.student_id, 'remarks', rem)}
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
