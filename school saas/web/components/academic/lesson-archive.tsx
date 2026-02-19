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
    const [publishing, setPublishing] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<'all' | 'lesson_plan' | 'lesson_note'>('all')

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

    const handlePublish = async (plan: LessonPlan) => {
        setPublishing(plan.id)
        try {
            // Dynamic import to avoid server action issues in client component
            const { createLesson } = await import("@/lib/actions/teacher-lesson-publisher")

            const weekNum = parseInt(plan.week?.replace("Week ", "") || "1")

            const res = await createLesson({
                title: plan.title,
                content: plan.content,
                subject: plan.subject,
                grade_level: "JSS 1", // TODO: Fetch from plan.class_id relation if possible
                week: weekNum,
                subtopics: plan.title,
                lessonPlanId: plan.id
            })

            if (res.success) {
                toast.success("Lesson Note Published to Student Locker!")
                router.refresh()
            } else {
                toast.error("Failed to publish")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setPublishing(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>
            case 'rejected':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
            case 'pending':
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

    const filteredPlans = plans.filter(plan => {
        if (filterType === 'all') return true
        return plan.type === filterType
    })

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
        <div className="space-y-6">
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5 self-start w-fit">
                <Button
                    variant={filterType === 'all' ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilterType('all')}
                    className={filterType === 'all' ? "bg-indigo-600 text-white hover:bg-indigo-700" : "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"}
                >
                    All ({plans.length})
                </Button>
                <Button
                    variant={filterType === 'lesson_plan' ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilterType('lesson_plan')}
                    className={filterType === 'lesson_plan' ? "bg-indigo-600 text-white hover:bg-indigo-700" : "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"}
                >
                    Plans ({plans.filter(p => p.type === 'lesson_plan' || !p.type).length})
                </Button>
                <Button
                    variant={filterType === 'lesson_note' ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setFilterType('lesson_note')}
                    className={filterType === 'lesson_note' ? "bg-indigo-600 text-white hover:bg-indigo-700" : "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"}
                >
                    Notes ({plans.filter(p => p.type === 'lesson_note').length})
                </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                {filteredPlans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <BookOpen className="h-10 w-10 mb-2" />
                        <p>No {filterType === 'lesson_plan' ? 'plans' : 'notes'} found in your archive.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                        {filteredPlans.map((plan) => (
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
                                            {getStatusBadge(plan.approval_status || 'draft')}
                                            {getTypeBadge(plan.type || 'lesson_plan')}
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate-500 font-mono">
                                        Last updated: {formatDate(plan.date || new Date())}
                                    </div>

                                    {plan.rejection_reason && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                                            <strong>Admin Feedback:</strong> {plan.rejection_reason}
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

                                        {(plan.approval_status === 'draft' || plan.approval_status === 'rejected' || !plan.approval_status) && (
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

                                        {/* Publish Action for Approved Notes */}
                                        {plan.type === 'lesson_note' && plan.approval_status === 'approved' && (
                                            <Button
                                                size="sm"
                                                variant={plan.status === 'published' ? "outline" : "default"}
                                                className={plan.status === 'published'
                                                    ? "flex-1 border-green-500/30 text-green-500 bg-green-500/5 cursor-not-allowed hover:bg-green-500/5"
                                                    : "flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                                                }
                                                onClick={() => handlePublish(plan)}
                                                disabled={publishing === plan.id || plan.status === 'published'}
                                            >
                                                {publishing === plan.id ? (
                                                    "Publishing..."
                                                ) : plan.status === 'published' ? (
                                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Published</>
                                                ) : (
                                                    <><BookOpen className="w-4 h-4 mr-2" /> Publish to Students</>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}
