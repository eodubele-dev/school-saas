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
            <DialogContent className="max-w-4xl bg-card border-border text-foreground max-h-[95vh] sm:max-h-[90vh] flex flex-col p-4 sm:p-8">
                <DialogHeader className="mb-4 sm:mb-6">
                    <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight">End of Term Evaluation</DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                        Evaluate <strong>{studentName}</strong>'s behavior and add your final remarks.
                    </DialogDescription>
                </DialogHeader>

                {isPublished ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                        <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-500 mb-4" />
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">Submitted Successfully</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center px-4">The evaluation has been sent to the Principal for approval.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <div className="w-full sm:flex-1 space-y-1.5 sm:space-y-2">
                                <Label className="text-[10px] sm:text-xs uppercase font-bold text-muted-foreground">Term</Label>
                                <Select value={term} onValueChange={setTerm}>
                                    <SelectTrigger className="bg-slate-950 border-border text-xs sm:text-sm h-9 sm:h-10">
                                        <SelectValue placeholder="Select Term" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card text-card-foreground">
                                        <SelectItem value="1st">1st Term</SelectItem>
                                        <SelectItem value="2nd">2nd Term</SelectItem>
                                        <SelectItem value="3rd">3rd Term</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full sm:flex-1 space-y-1.5 sm:space-y-2">
                                <Label className="text-[10px] sm:text-xs uppercase font-bold text-muted-foreground">Session</Label>
                                <Select value={session} onValueChange={setSession}>
                                    <SelectTrigger className="bg-slate-950 border-border text-xs sm:text-sm h-9 sm:h-10">
                                        <SelectValue placeholder="Select Session" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card text-card-foreground">
                                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                                        <SelectItem value="2025/2026">2025/2026</SelectItem>
                                        <SelectItem value="2026/2027">2026/2027</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-6 sm:space-y-8 scrollbar-thin">
                            <div className="space-y-4 sm:space-y-6">
                                <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">
                                    Behavioral Assessment (1-5)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                    {Object.entries(CATEGORIES).map(([category, attributes]) => (
                                        <div key={category} className="space-y-3 bg-slate-900/30 p-3 sm:p-4 rounded-xl border border-border/50">
                                            <h4 className="text-xs sm:text-sm font-bold text-[var(--school-accent)]">{category}</h4>
                                            {attributes.map(attr => (
                                                <div key={attr} className="flex items-center justify-between gap-2">
                                                    <span className="text-[11px] sm:text-sm text-slate-300 truncate">{attr}</span>
                                                    <div className="flex gap-1 shrink-0">
                                                        {[1, 2, 3, 4, 5].map(rating => (
                                                            <button
                                                                key={rating}
                                                                onClick={() => handleRatingChange(attr, rating)}
                                                                className={`h-6 w-6 sm:h-7 sm:w-7 rounded-md border flex items-center justify-center text-[10px] sm:text-xs font-black transition-all ${
                                                                    affectiveDomain[attr] === rating 
                                                                    ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-lg shadow-blue-500/20' 
                                                                    : 'bg-slate-950 border-border text-slate-500 hover:border-blue-500/50'
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
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-2 gap-2">
                                    <h3 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">
                                        Form Teacher's Overall Summary
                                    </h3>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={handleGenerateAI}
                                        disabled={isGeneratingAI}
                                        className="text-blue-400 hover:text-white hover:bg-blue-600/20 h-7 text-[10px] font-bold self-start sm:self-auto"
                                    >
                                        {isGeneratingAI ? <Loader2 className="h-3 w-3 mr-2 animate-spin" /> : <Sparkles className="h-3 w-3 mr-2" />}
                                        Generate AI Summary
                                    </Button>
                                </div>
                                <Textarea 
                                    placeholder="Enter your comprehensive evaluation..."
                                    className="min-h-[100px] sm:min-h-[120px] bg-slate-950 border-border text-xs sm:text-sm"
                                    value={teacherRemark}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTeacherRemark(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t border-white/5">
                            <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="h-10 sm:h-11 font-bold text-xs sm:text-sm order-3 sm:order-1">
                                Cancel
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => handleSubmit('draft')}
                                disabled={isSubmitting}
                                className="h-10 sm:h-11 font-bold text-xs sm:text-sm border-white/10 bg-white/5 text-slate-300 order-2"
                            >
                                Save Draft
                            </Button>
                            <Button 
                                onClick={() => handleSubmit('submitted_for_review')}
                                disabled={isSubmitting}
                                className="h-10 sm:h-11 font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 order-1 sm:order-3"
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
