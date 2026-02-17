"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, User, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

interface ViewFeedbackModalProps {
    assignment: {
        id: string
        title: string
        description?: string
        teacher: string
        grade?: number | null
        points: number
        feedback?: string | null
        submittedDate?: string
    }
    trigger?: React.ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ViewFeedbackModal({ assignment, trigger, isOpen, onOpenChange }: ViewFeedbackModalProps) {
    // If controlled externally
    const handleOpenChange = (open: boolean) => {
        if (onOpenChange) {
            onOpenChange(open)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[600px] bg-slate-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Assignment Graded
                    </DialogTitle>
                    <DialogDescription>
                        Feedback and score for your submission.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Header Details */}
                    <div className="flex items-start justify-between border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">{assignment.title}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                <User className="h-3.5 w-3.5" />
                                <span>{assignment.teacher}</span>
                            </div>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 text-center">
                            <span className="text-3xl font-black text-green-400 leading-none block">{assignment.grade}</span>
                            <span className="text-[10px] uppercase font-bold text-green-500/60 mt-1 block tracking-widest">
                                Score / {assignment.points}
                            </span>
                        </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Teacher Feedback</h4>
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 min-h-[100px]">
                            {assignment.feedback ? (
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {assignment.feedback}
                                </p>
                            ) : (
                                <span className="text-slate-500 italic">No written feedback provided.</span>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    {assignment.submittedDate && (
                        <div className="text-xs text-slate-500 text-right">
                            Submitted on {format(new Date(assignment.submittedDate), "PPP p")}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} className="bg-transparent border-white/10 text-slate-400 hover:bg-white/5 hover:text-white">
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
