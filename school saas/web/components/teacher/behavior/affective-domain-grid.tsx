"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { saveBehavioralRatings, generateBehavioralRemark } from "@/lib/actions/behavior"
import { toast } from "sonner"
import { Loader2, Wand2, Save } from "lucide-react"

// Simple 1-5 Radio Group
function RatingInput({ value, onChange }: { value: number, onChange: (v: number) => void }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
                <button
                    key={num}
                    onClick={() => onChange(num)}
                    className={`
                        h-6 w-6 rounded text-[10px] font-bold transition-colors
                        ${value === num
                            ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                            : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}
                    `}
                >
                    {num}
                </button>
            ))}
        </div>
    )
}

export function AffectiveDomainGrid({ students }: { students: any[] }) {
    // State: Map of studentID -> Ratings
    const [ratings, setRatings] = useState<Record<string, any>>(() => {
        const initial: any = {}
        students.forEach(s => {
            initial[s.id] = {
                punctuality: 3, neatness: 3, politeness: 3, honesty: 3,
                cooperation: 3, leadership: 3, attentiveness: 3, peer_relations: 3,
                remark: ""
            }
        })
        return initial
    })
    const [saving, setSaving] = useState(false)
    const [generating, setGenerating] = useState<string | null>(null) // Student ID being generated

    const updateRating = (studentId: string, field: string, value: any) => {
        setRatings(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }))
    }

    const handleAutoGenerate = async (studentId: string, studentName: string) => {
        setGenerating(studentId)
        try {
            const res = await generateBehavioralRemark(ratings[studentId], studentName)
            if (res.success && res.remark) {
                updateRating(studentId, 'remark', res.remark)
            }
        } catch (e) {
            toast.error("Failed to generate remark")
        } finally {
            setGenerating(null)
        }
    }

    const handleSaveAll = async () => {
        setSaving(true)
        try {
            const payload = Object.entries(ratings).map(([sid, rating]) => ({
                student_id: sid,
                ...rating
            }))

            // Hardcoded term for demo
            const res = await saveBehavioralRatings(students[0].class_id, "Term 1", "2025/2026", payload)

            if (res.success) {
                toast.success("All ratings saved securely.")
            } else {
                toast.error(`Save failed: ${res.error}`)
            }
        } catch (e) {
            toast.error("Error saving.")
        } finally {
            setSaving(false)
        }
    }

    const applyToAll = (field: string, value: number) => {
        setRatings(prev => {
            const next = { ...prev }
            students.forEach(s => {
                next[s.id] = { ...next[s.id], [field]: value }
            })
            return next
        })
        toast.info(`Applied ${value} for ${field} to all students.`)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h3 className="text-white font-bold text-lg">Termly Affective Domain</h3>
                    <p className="text-slate-400 text-sm">End-of-term behavioral assessment (1-5 Scale).</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => applyToAll('neatness', 5)} className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-400">
                        All Neat: 5
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyToAll('politeness', 5)} className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-400">
                        All Polite: 5
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyToAll('leadership', 5)} className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-400">
                        All Leaders: 5
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyToAll('attentiveness', 5)} className="border-cyan-500/20 text-cyan-400 hover:bg-cyan-950 hover:text-cyan-400">
                        All Focused: 5
                    </Button>
                    <Button onClick={handleSaveAll} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] min-w-[160px]">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save All Ratings
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border border-white/5 bg-slate-900 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-950">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-white w-[200px]">Student</TableHead>
                            <TableHead className="text-center text-xs w-[80px] text-cyan-100/70">Punc.</TableHead>
                            <TableHead className="text-center text-xs w-[80px] text-cyan-100/70">Neat.</TableHead>
                            <TableHead className="text-center text-xs w-[80px] text-cyan-100/70">Polite.</TableHead>
                            <TableHead className="text-center text-xs w-[80px] text-cyan-100/70">Honesty</TableHead>
                            <TableHead className="text-center text-xs w-[80px] text-cyan-100/70">Coop.</TableHead>
                            <TableHead className="text-center text-xs w-[80px] text-cyan-100/70">Lead.</TableHead>
                            <TableHead className="text-center text-xs w-[80px] text-cyan-100/70">Focus</TableHead>
                            <TableHead className="text-center text-xs w-[80px] text-cyan-100/70">Peers</TableHead>
                            <TableHead className="text-white">Auto-Remark (AI)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id} className="border-white/5 hover:bg-slate-800/50">
                                <TableCell className="font-medium text-slate-200">
                                    {student.full_name}
                                </TableCell>
                                <TableCell className="text-center">
                                    <RatingInput
                                        value={ratings[student.id]?.punctuality || 3}
                                        onChange={(v) => updateRating(student.id, 'punctuality', v)}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <RatingInput
                                        value={ratings[student.id]?.neatness || 3}
                                        onChange={(v) => updateRating(student.id, 'neatness', v)}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <RatingInput
                                        value={ratings[student.id]?.politeness || 3}
                                        onChange={(v) => updateRating(student.id, 'politeness', v)}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <RatingInput
                                        value={ratings[student.id]?.honesty || 3}
                                        onChange={(v) => updateRating(student.id, 'honesty', v)}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <RatingInput
                                        value={ratings[student.id]?.cooperation || 3}
                                        onChange={(v) => updateRating(student.id, 'cooperation', v)}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <RatingInput
                                        value={ratings[student.id]?.leadership || 3}
                                        onChange={(v) => updateRating(student.id, 'leadership', v)}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <RatingInput
                                        value={ratings[student.id]?.attentiveness || 3}
                                        onChange={(v) => updateRating(student.id, 'attentiveness', v)}
                                    />
                                </TableCell>
                                <TableCell className="text-center">
                                    <RatingInput
                                        value={ratings[student.id]?.peer_relations || 3}
                                        onChange={(v) => updateRating(student.id, 'peer_relations', v)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                className="w-full bg-slate-950 border border-white/10 rounded px-2 py-1 text-xs text-slate-300"
                                                value={ratings[student.id]?.remark || ""}
                                                onChange={(e) => updateRating(student.id, 'remark', e.target.value)}
                                                placeholder="Generates here..."
                                            />
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                                            onClick={() => handleAutoGenerate(student.id, student.full_name)}
                                            disabled={generating === student.id}
                                        >
                                            {generating === student.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div >
    )
}
