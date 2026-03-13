"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { upsertStudentResult, getTermResult, generateOverallSummaryAI, AffectiveDomain } from "@/lib/actions/results"
import { Loader2, CheckCircle2, Sparkles } from "lucide-react"

interface StudentEvaluationModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string
    studentName: string
    classId: string
}

const CATEGORIES = {
    "Personal Dev.": ['Punctuality', 'Neatness', 'Politeness', 'Honesty', 'Reliability'],
    "Social Behaviour": ['Cooperation', 'Leadership', 'Respect', 'Self-Control', 'Empathy'],
    "Work Habits": ['Attentiveness', 'Initiative', 'Perseverance', 'Organization', 'Participation'],
    "Practical Skills": ['Handwriting', 'Sports & Games', 'Arts & Crafts', 'Musical Skills', 'Fluency']
}

export function StudentEvaluationModal({ isOpen, onClose, studentId, studentName, classId }: StudentEvaluationModalProps) {
    const [term, setTerm] = useState("1st")
    const [session, setSession] = useState("2025/2026")
    const [affectiveDomain, setAffectiveDomain] = useState<AffectiveDomain>({})
    const [teacherRemark, setTeacherRemark] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isPublished, setIsPublished] = useState(false)
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setAffectiveDomain({})
            setTeacherRemark("")
            setIsPublished(false)
            
            // Load existing draft if any
            const loadDraft = async () => {
                const draft = await getTermResult(studentId, classId, term, session)
                if (draft) {
                    if (draft.affective_domain) setAffectiveDomain(draft.affective_domain)
                    if (draft.teacher_remark) setTeacherRemark(draft.teacher_remark)
                    if (draft.status === 'submitted_for_review' || draft.status === 'published' || draft.status === 'approved_by_principal') {
                        setIsPublished(true) 
                    }
                }
            }
            loadDraft()
        }
    }, [isOpen, studentId, classId, term, session])

    const handleRatingChange = (attribute: string, rating: number) => {
        setAffectiveDomain(prev => ({ ...prev, [attribute]: rating }))
    }

    const handleGenerateAI = async () => {
        if (Object.keys(affectiveDomain).length === 0) {
            toast.error("Please rate at least one behavior first so the AI has context.")
            return
        }
        setIsGeneratingAI(true)
        try {
            const res = await generateOverallSummaryAI(studentName, affectiveDomain)
            if (res.success && res.remark) {
                setTeacherRemark(res.remark)
                toast.success("AI Summary generated")
            } else {
                toast.error("Failed to generate summary")
            }
        } catch (e) {
            toast.error("AI Generation Error")
        } finally {
            setIsGeneratingAI(false)
        }
    }

    const handleSubmit = async (status: 'draft' | 'submitted_for_review') => {
        if (status === 'submitted_for_review') {
            if (Object.keys(affectiveDomain).length === 0) {
                toast.error("Please rate at least one behavioral attribute.")
                return
            }
            if (!teacherRemark.trim()) {
                toast.error("Please provide a Form Teacher's Remark.")
                return
            }
        }

        setIsSubmitting(true)
        try {
            const res = await upsertStudentResult(
                studentId,
                classId,
                term,
                session,
                affectiveDomain,
                teacherRemark,
                status
            )

            if (res.success) {
                toast.success(`Evaluation ${status === 'draft' ? 'saved as draft' : 'submitted to Principal'}`)
                if (status === 'submitted_for_review') {
                    setIsPublished(true)
                    setTimeout(onClose, 2000)
                }
            } else {
                toast.error(res.error || "Failed to save evaluation")
            }
        } catch (e) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-card border-border text-foreground max-h-[90vh] flex flex-col pt-8">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl">End of Term Evaluation</DialogTitle>
                    <DialogDescription>
                        Evaluate <strong>{studentName}</strong>'s behavior and add your final remarks.
                    </DialogDescription>
                </DialogHeader>

                {isPublished ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
                        <h2 className="text-xl font-bold text-foreground">Submitted Successfully</h2>
                        <p className="text-muted-foreground mt-2">The evaluation has been sent to the Principal for approval.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 space-y-2">
                                <Label>Academic Term</Label>
                                <Select value={term} onValueChange={setTerm}>
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue placeholder="Select Term" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1st">1st Term</SelectItem>
                                        <SelectItem value="2nd">2nd Term</SelectItem>
                                        <SelectItem value="3rd">3rd Term</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label>Academic Session</Label>
                                <Select value={session} onValueChange={setSession}>
                                    <SelectTrigger className="bg-background border-border">
                                        <SelectValue placeholder="Select Session" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                                        <SelectItem value="2025/2026">2025/2026</SelectItem>
                                        <SelectItem value="2026/2027">2026/2027</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                                    Behavioral Assessment (1-5)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {Object.entries(CATEGORIES).map(([category, attributes]) => (
                                        <div key={category} className="space-y-3 bg-slate-900/50 p-4 rounded-lg border border-border">
                                            <h4 className="font-semibold text-primary">{category}</h4>
                                            {attributes.map(attr => (
                                                <div key={attr} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-300">{attr}</span>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(rating => (
                                                            <button
                                                                key={rating}
                                                                onClick={() => handleRatingChange(attr, rating)}
                                                                className={`h-7 w-7 rounded-sm border flex items-center justify-center text-xs font-bold transition-all ${
                                                                    affectiveDomain[attr] === rating 
                                                                    ? 'bg-primary border-primary text-white scale-110' 
                                                                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                                                                }`}
                                                            >
                                                                {rating}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-border pb-2">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                        Form Teacher's Overall Summary
                                    </h3>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={handleGenerateAI}
                                        disabled={isGeneratingAI}
                                        className="text-[var(--school-accent)] hover:text-foreground hover:bg-[var(--school-accent)]/20 h-7 text-xs"
                                    >
                                        {isGeneratingAI ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Sparkles className="h-3 w-3 mr-2" />}
                                        Generate AI Summary
                                    </Button>
                                </div>
                                <Textarea 
                                    placeholder="Enter your comprehensive evaluation of the student's performance..."
                                    className="min-h-[120px] bg-background border-border"
                                    value={teacherRemark}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTeacherRemark(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={() => handleSubmit('draft')}
                                disabled={isSubmitting}
                            >
                                Save Draft
                            </Button>
                            <Button 
                                onClick={() => handleSubmit('submitted_for_review')}
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-white"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Submit to Principal
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
