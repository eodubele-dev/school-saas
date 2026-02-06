"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Lock, Save, AlertCircle, Rocket } from "lucide-react"
import { upsertGrade, lockClassGrades, unlockClassGrades, GradeEntry } from "@/lib/actions/gradebook"
import { RemarkGenerator } from "./remark-generator"
import { AnalyticsHeader } from "./analytics-header"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

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
    userRole?: string
    domain: string
    term: string
    session: string
}

export function GradeEntryGrid({ initialGrades, classId, subjectId, userRole, domain, term, session }: GradeEntryGridProps) {
    const [grades, setGrades] = useState<GradeEntry[]>(initialGrades)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [isLocked, setIsLocked] = useState(initialGrades[0]?.is_locked || false)
    const [pendingUpdates, setPendingUpdates] = useState<Set<string>>(new Set())
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        variant: "default" | "destructive" | "warning";
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { },
        variant: "default"
    })

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

    // High-Speed Keyboard Navigation (Enter to move vertically)
    const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number, field: string) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const direction = e.shiftKey ? -1 : 1
            const nextIndex = currentIndex + direction
            if (nextIndex >= 0 && nextIndex < grades.length) {
                const nextInput = document.querySelector(`[data-row-index="${nextIndex}"][data-field="${field}"]`) as HTMLInputElement
                if (nextInput) nextInput.focus()
            }
        }
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
        setConfirmDialog({
            isOpen: true,
            title: "Submit for Approval?",
            description: "Are you sure? This will lock grades for Admin review. You won't be able to make changes until they are unlocked.",
            variant: "warning",
            onConfirm: async () => {
                const res = await lockClassGrades(domain, classId, subjectId, term, session)
                if (res.success) {
                    setIsLocked(true)
                    toast.success("Grades submitted for approval")
                } else {
                    toast.error("Failed to submit grades")
                }
            }
        })
    }

    const handleUnlock = async () => {
        setConfirmDialog({
            isOpen: true,
            title: "Unlock Result Sheet?",
            description: "This will allow the teacher to edit scores again. Are you sure you want to unlock these grades?",
            variant: "default",
            onConfirm: async () => {
                const res = await unlockClassGrades(domain, classId, subjectId, term, session)
                if (res.success) {
                    setIsLocked(false)
                    toast.success("Grades unlocked successfully")
                } else {
                    toast.error(res.error || "Failed to unlock grades")
                }
            }
        })
    }

    const normalizedRole = userRole?.toLowerCase().trim()
    const isAdmin = normalizedRole === 'admin' || normalizedRole === 'owner' || normalizedRole === 'manager'

    return (
        <div className="space-y-6" data-user-role={userRole} data-is-admin={isAdmin ? "true" : "false"}>
            <AnalyticsHeader grades={grades} />

            <div className="flex justify-between items-center bg-slate-900 p-4 border border-white/5 rounded-t-lg">
                <h3 className="text-lg font-bold text-white">Student Scores</h3>
                <div className="flex items-center gap-3">
                    {isLocked ? (
                        <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                            <Lock className="h-4 w-4" />
                            <span className="text-sm font-black uppercase tracking-widest">Locked for Approval</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 animate-pulse-subtle">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-sm font-black uppercase tracking-widest">Active Entry / Draft</span>
                        </div>
                    )}

                    {isLocked && isAdmin ? (
                        <Button onClick={handleUnlock} variant="outline" className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300 font-bold uppercase tracking-tighter">
                            <Lock className="h-4 w-4 mr-2" /> Unlock Grades
                        </Button>
                    ) : !isLocked && (
                        <Button onClick={handleLock} variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 font-bold uppercase tracking-tighter shadow-lg shadow-red-500/5">
                            <Rocket className="h-4 w-4 mr-2" /> Submit for Approval
                        </Button>
                    )}
                </div>
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
                        {grades.map((grade, index) => (
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
                                        data-row-index={index}
                                        data-field="ca1"
                                        onKeyDown={(e) => handleKeyDown(e, index, 'ca1')}
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
                                        data-row-index={index}
                                        data-field="ca2"
                                        onKeyDown={(e) => handleKeyDown(e, index, 'ca2')}
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
                                        data-row-index={index}
                                        data-field="exam"
                                        onKeyDown={(e) => handleKeyDown(e, index, 'exam')}
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
                                            data-row-index={index}
                                            data-field="remarks"
                                            onKeyDown={(e) => handleKeyDown(e, index, 'remarks')}
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

            <ConfirmationModal
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                description={confirmDialog.description}
                variant={confirmDialog.variant}
                confirmText="Proceed"
            />
        </div>
    )
}
