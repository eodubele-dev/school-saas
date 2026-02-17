"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Loader2, CheckCircle2, User, ExternalLink, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { getAssignmentSubmissions, gradeAssignmentSubmission } from "@/lib/actions/assignments"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface SubmissionsViewProps {
    assignmentId: string
    isOpen: boolean
    onClose: () => void
    assignmentTitle: string
    maxPoints: number
}

export function SubmissionsView({ assignmentId, isOpen, onClose, assignmentTitle, maxPoints }: SubmissionsViewProps) {
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
    const [grade, setGrade] = useState<string>("")
    const [feedback, setFeedback] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)

    const fetchSubmissions = async () => {
        setLoading(true)
        try {
            const res = await getAssignmentSubmissions(assignmentId)
            if (res.success) {
                setSubmissions(res.data || [])
            } else {
                toast.error(res.error || "Failed to load submissions")
            }
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchSubmissions()
            setSelectedSubmission(null)
        }
    }, [isOpen, assignmentId])

    const handleSelectSubmission = (sub: any) => {
        setSelectedSubmission(sub)
        setGrade(sub.grade?.toString() || "")
        setFeedback(sub.teacher_feedback || "")
    }

    const handleSaveGrade = async () => {
        if (!selectedSubmission) return

        const gradeNum = parseFloat(grade)
        if (isNaN(gradeNum)) {
            toast.error("Please enter a valid number for the grade")
            return
        }

        if (gradeNum > maxPoints) {
            toast.error(`Grade cannot exceed maximum points (${maxPoints})`)
            return
        }

        setIsSaving(true)
        try {
            const res = await gradeAssignmentSubmission(selectedSubmission.id, gradeNum, feedback)
            if (res.success) {
                toast.success("Grade saved and student notified!")
                onClose()
            } else {
                toast.error(res.error || "Failed to save grade")
            }
        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] h-[80vh] bg-slate-950 border-slate-800 text-white flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-white/5 space-y-1">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                        Submissions: {assignmentTitle}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Review student work and assign grades. Max points: {maxPoints}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Sidebar Submissions List */}
                    <div className="w-1/3 border-r border-white/5 overflow-y-auto bg-slate-950/50">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 italic text-sm">
                                No submissions yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {submissions.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => handleSelectSubmission(sub)}
                                        className={`w-full text-left p-4 hover:bg-white/5 transition-colors flex items-center justify-between ${selectedSubmission?.id === sub.id ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''}`}
                                    >
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <span className="text-sm font-bold truncate">{sub.student?.full_name}</span>
                                            <span className="text-[10px] text-slate-500 font-mono italic">
                                                {format(new Date(sub.submitted_at), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                        {sub.grade !== null ? (
                                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-1.5 py-0 text-[10px]">
                                                {sub.grade}/{maxPoints}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-700">
                                                Pending
                                            </Badge>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Submission Detail & Grading */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-900/10">
                        {selectedSubmission ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedSubmission.student?.full_name}</h3>
                                            <p className="text-xs text-slate-500">Reg No: {selectedSubmission.student?.admission_number}</p>
                                        </div>
                                    </div>
                                    {selectedSubmission.file_url && (
                                        <Button
                                            size="sm"
                                            className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                                            onClick={() => window.open(selectedSubmission.file_url, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Attachment
                                        </Button>
                                    )}
                                </div>

                                <div className="bg-black/30 rounded-xl p-5 border border-white/5 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-2">Student Submission Content</h4>
                                    <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                        {selectedSubmission.content || "No text content provided."}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-400">Score (Out of {maxPoints})</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                className="bg-slate-900 border-slate-700 h-10"
                                                value={grade}
                                                onChange={(e) => setGrade(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-slate-400">Teacher Feedback</Label>
                                        <Textarea
                                            placeholder="Write comments or feedback for the student..."
                                            className="bg-slate-900 border-slate-700 min-h-[100px]"
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-10"
                                        onClick={handleSaveGrade}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving Grade...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Finalize Grade
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center">
                                    <ArrowLeft className="h-8 w-8 text-slate-600" />
                                </div>
                                <div className="max-w-[250px]">
                                    <p className="text-slate-400 font-medium">Select a student from the list to view their work and assign a grade.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
