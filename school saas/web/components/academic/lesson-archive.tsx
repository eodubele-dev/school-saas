'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, Edit, Send, CheckCircle2, XCircle, Clock, BookOpen, FileText } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { submitLessonPlan, LessonPlan } from "@/lib/actions/lesson-plan"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface LessonArchiveProps {
    plans: LessonPlan[]
    onEdit: (plan: LessonPlan) => void
}

export function LessonArchive({ plans, onEdit }: LessonArchiveProps) {
    const router = useRouter()
    const [submitting, setSubmitting] = useState<string | null>(null)

    const handleSubmit = async (id: string) => {
        setSubmitting(id)
        try {
            const res = await submitLessonPlan(id)
            if (res.success) {
                toast.success("Lesson Plan Submitted for Approval!")
                router.refresh()
            } else {
                toast.error("Failed to submit plan")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setSubmitting(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>
            case 'rejected':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
            case 'submitted':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"><Clock className="w-3 h-3 mr-1" /> Submitted</Badge>
            default:
                return <Badge variant="outline" className="text-slate-500 border-slate-700">Draft</Badge>
        }
    }

    const getTypeBadge = (type: string) => {
        if (type === 'lesson_note') {
            return <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20"><BookOpen className="w-3 h-3 mr-1" /> Note</Badge>
        }
        return <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"><FileText className="w-3 h-3 mr-1" /> Plan</Badge>
    }

    if (plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-slate-900/50 rounded-xl border border-white/5">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Archived Plans</h3>
                <p className="text-slate-400 max-w-sm">
                    You haven't saved any lesson plans yet. Generate a new plan and click "Save to Archive".
                </p>
            </div>
        )
    }

    return (
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                {plans.map((plan) => (
                    <Card key={plan.id} className="bg-slate-900 border-white/10 overflow-hidden hover:border-white/20 transition-all group">
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-white line-clamp-1" title={plan.title}>
                                        {plan.title || "Untitled Plan"}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {plan.subject} • {plan.week}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {getStatusBadge(plan.status || 'draft')}
                                    {getTypeBadge(plan.type || 'lesson_plan')}
                                </div>
                            </div>

                            <div className="text-xs text-slate-500 font-mono">
                                Last updated: {formatDate(plan.date || new Date())}
                            </div>

                            {plan.feedback && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                    <strong>Feedback:</strong> {plan.feedback}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                                    onClick={() => router.push(`?tab=ai&edit_id=${plan.id}`)}
                                >
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>

                                {(plan.status === 'draft' || plan.status === 'rejected' || !plan.status) && (
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => handleSubmit(plan.id)}
                                        disabled={submitting === plan.id}
                                    >
                                        {submitting === plan.id ? (
                                            "Sending..."
                                        ) : (
                                            <><Send className="w-4 h-4 mr-2" /> Submit</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    )
}
