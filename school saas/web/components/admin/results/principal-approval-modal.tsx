"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updatePrincipalRemark, publishResult, TermResult } from "@/lib/actions/results"
import { Loader2, CheckCircle2 } from "lucide-react"

interface PrincipalApprovalModalProps {
    isOpen: boolean
    onClose: () => void
    result: any // In production, type properly
    onPublished: () => void
}

const CATEGORIES = {
    "Personal Dev.": ['Punctuality', 'Neatness', 'Politeness', 'Honesty', 'Reliability'],
    "Social Behaviour": ['Cooperation', 'Leadership', 'Respect', 'Self-Control', 'Empathy'],
    "Work Habits": ['Attentiveness', 'Initiative', 'Perseverance', 'Organization', 'Participation'],
    "Practical Skills": ['Handwriting', 'Sports & Games', 'Arts & Crafts', 'Musical Skills', 'Fluency']
}

export function PrincipalApprovalModal({ isOpen, onClose, result, onPublished }: PrincipalApprovalModalProps) {
    const [principalRemark, setPrincipalRemark] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isPublished, setIsPublished] = useState(false)

    useEffect(() => {
        if (isOpen && result) {
            setPrincipalRemark(result.principal_remark || "")
            setIsPublished(result.status === 'published')
        }
    }, [isOpen, result])

    if (!result) return null

    const studentName = result.students ? `${result.students.first_name} ${result.students.last_name}` : 'Unknown Student'
    const affectiveDomain = result.affective_domain || {}

    const handlePublish = async () => {
        if (!principalRemark.trim()) {
            toast.error("Please enter a principal summary before publishing.")
            return
        }

        setIsSubmitting(true)
        try {
            const res = await updatePrincipalRemark(result.id, principalRemark, true)
            if (res.success) {
                toast.success("Result published successfully!")
                setIsPublished(true)
                onPublished()
                setTimeout(onClose, 2000)
            } else {
                toast.error(res.error || "Failed to publish result")
            }
        } catch (e) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSaveDraft = async () => {
        setIsSubmitting(true)
        try {
            const res = await updatePrincipalRemark(result.id, principalRemark, false)
            if (res.success) {
                toast.success("Remark saved")
            } else {
                toast.error(res.error || "Failed to save remark")
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
                <DialogHeader className="mb-4 text-left">
                    <DialogTitle className="text-xl">Principal Review: {studentName}</DialogTitle>
                    <DialogDescription>
                        Term: <strong>{result.term}</strong> • Session: <strong>{result.session_id}</strong>
                    </DialogDescription>
                </DialogHeader>

                {isPublished ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
                        <h2 className="text-xl font-bold text-foreground">Result Published</h2>
                        <p className="text-muted-foreground mt-2">This result sheet is now live for the student and parents.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                            {/* Teacher's Submission */}
                            <div className="bg-slate-900/50 p-5 rounded-lg border border-border">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Teacher's Evaluation
                                </h3>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    {Object.entries(CATEGORIES).map(([category, attributes]) => (
                                        <div key={category} className="space-y-1">
                                            <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">{category}</h4>
                                            {attributes.map(attr => (
                                                <div key={attr} className="flex justify-between items-center text-xs text-slate-300">
                                                    <span>{attr}</span>
                                                    <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">{affectiveDomain[attr] || '-'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-border/50 pt-4">
                                    <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2">Teacher's Remark</h4>
                                    <p className="text-sm italic text-slate-300 bg-black/20 p-3 rounded border border-white/5">
                                        "{result.teacher_remark || 'No remark provided.'}"
                                    </p>
                                </div>
                            </div>

                            {/* Principal Section */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-500"></span>
                                    Principal's Summary
                                </h3>
                                <Textarea 
                                    placeholder="Enter your final summary and official remark for this student. This will appear on the final Result Sheet alongside your signature."
                                    className="min-h-[120px] bg-background border-border"
                                    value={principalRemark}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrincipalRemark(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between mt-6 pt-4 border-t border-border">
                            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <div className="flex gap-3">
                                <Button 
                                    variant="secondary" 
                                    onClick={handleSaveDraft}
                                    disabled={isSubmitting}
                                >
                                    Save Draft
                                </Button>
                                <Button 
                                    onClick={handlePublish}
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Approve & Publish Result
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
