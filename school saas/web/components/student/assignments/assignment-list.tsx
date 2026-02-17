"use client"

import { useState, useEffect } from "react"
import { FileText, File as FileIcon, Calendar, CheckCircle2, Clock, ChevronRight, UploadCloud, Loader2, User } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubmitAssignmentModal } from "./submit-assignment-modal"
import { ViewFeedbackModal } from "./view-feedback-modal"
import { toast } from "sonner"
import { getStudentAssignments } from "@/lib/actions/assignments"
import { createClient } from "@/lib/supabase/client"

type Assignment = {
    id: string
    title: string
    subject: string
    teacher: string
    dueDate: string
    status: 'pending' | 'submitted' | 'graded'
    points: number
    description?: string
    submittedDate?: string
    grade?: number | null
    type?: string
    feedback?: string | null
}

export function AssignmentList({ initialData }: { initialData?: any[] }) {
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(!initialData)
    const [viewingFeedback, setViewingFeedback] = useState<Assignment | null>(null)

    const mapData = (data: any[]): Assignment[] => {
        return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            subject: d.subject,
            teacher: d.teacher,
            dueDate: d.dueDate || d.due_date,
            status: d.status,
            points: d.points,
            description: d.description,
            submittedDate: d.submittedDate,
            grade: d.grade,
            type: d.type || 'assignment',
            feedback: d.feedback
        }))
    }

    const fetchAssignments = async () => {
        try {
            const { success, data, error } = await getStudentAssignments()
            if (success && data) {
                setAssignments(mapData(data))
            } else {
                console.error("Failed to fetch assignments:", error)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (initialData) {
            setAssignments(mapData(initialData))
            setLoading(false)
        } else {
            fetchAssignments()
        }

        const supabase = createClient()
        const channel = supabase
            .channel('student-assignments-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'assignments'
                },
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        // Immediate removal for better UX
                        setAssignments(current => current.filter(a => a.id !== payload.old.id))
                        toast.info("Assignment list updated")
                    } else {
                        // For INSERT/UPDATE, we strictly need to re-fetch to get joined data (subject, teacher names)
                        fetchAssignments()
                        if (payload.eventType === 'INSERT') toast.info("New assignment posted!")
                        if (payload.eventType === 'UPDATE') toast.info("Assignment updated")
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [initialData]) // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="pending" className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <TabsList className="bg-slate-900 border border-white/10">
                        <TabsTrigger value="pending" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            Pending
                        </TabsTrigger>
                        <TabsTrigger value="submitted" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            Submitted
                        </TabsTrigger>
                        <TabsTrigger value="graded" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            Graded
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pending" className="space-y-4">
                    {assignments.filter(a => a.status === 'pending').map(assignment => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            onSuccess={fetchAssignments}
                        />
                    ))}
                    {assignments.filter(a => a.status === 'pending').length === 0 && (
                        <EmptyState message="No pending assignments! Great job." />
                    )}
                </TabsContent>

                <TabsContent value="submitted" className="space-y-4">
                    {assignments.filter(a => a.status === 'submitted').map(assignment => (
                        <AssignmentCard key={assignment.id} assignment={assignment} />
                    ))}
                    {assignments.filter(a => a.status === 'submitted').length === 0 && (
                        <EmptyState message="No submitted assignments yet." />
                    )}
                </TabsContent>

                <TabsContent value="graded" className="space-y-4">
                    {assignments.filter(a => a.status === 'graded').map(assignment => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            onViewFeedback={() => setViewingFeedback(assignment)}
                        />
                    ))}
                    {assignments.filter(a => a.status === 'graded').length === 0 && (
                        <EmptyState message="No graded assignments yet." />
                    )}
                </TabsContent>
            </Tabs>

            {/* View Feedback Modal */}
            {viewingFeedback && (
                <ViewFeedbackModal
                    assignment={viewingFeedback}
                    isOpen={!!viewingFeedback}
                    onOpenChange={(open) => !open && setViewingFeedback(null)}
                />
            )}
        </div>
    )
}

function AssignmentCard({ assignment, onSuccess, onViewFeedback }: { assignment: any, onSuccess?: () => void, onViewFeedback?: () => void }) {
    const isPending = assignment.status === 'pending'
    const isGraded = assignment.status === 'graded'

    const formatDate = (dateString: string) => {
        if (!dateString) return "No Due Date"
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return "Invalid Date"
        return format(date, "PPP")
    }

    return (
        <Card className="bg-slate-900/50 border-white/5 hover:border-[var(--school-accent)]/30 transition-all duration-300 shadow-xl overflow-hidden group">
            <CardHeader className="pb-4 relative">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="border-cyan-500/20 bg-cyan-500/5 text-cyan-400 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5">
                                {assignment.subject}
                            </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-white tracking-tight group-hover:text-[var(--school-accent)] transition-colors">
                            {assignment.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-slate-400">
                            <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                                <User className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium">{assignment.teacher}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {isGraded ? (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 text-center">
                                <span className="text-2xl font-black text-green-400 leading-none block">{assignment.grade}</span>
                                <span className="text-[10px] uppercase font-bold text-green-500/60 mt-1 block tracking-widest">Score / {assignment.points}</span>
                            </div>
                        ) : (
                            <Badge className={`${isPending ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'} border px-3 py-1 font-bold tracking-tighter`}>
                                {isPending ? 'Action Required' : 'Under Review'}
                            </Badge>
                        )}
                    </div>
                </div>

                {assignment.description && (
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 mb-2 group-hover:bg-black/60 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-3 bg-[var(--school-accent)] rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Assignment Materials & Questions</span>
                            </div>
                            {assignment.fileUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[10px] bg-white/5 border-white/10 hover:bg-white/10 text-cyan-400 font-bold uppercase tracking-tighter"
                                    onClick={() => window.open(assignment.fileUrl, '_blank')}
                                >
                                    <FileIcon className="h-3 w-3 mr-1.5" />
                                    Download Question Paper
                                </Button>
                            )}
                        </div>
                        <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                            {assignment.description}
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-0 border-t border-white/5 bg-slate-900/40">
                <div className="flex flex-wrap items-center justify-between gap-4 py-3 mt-1">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-slate-400">
                            <Calendar className="h-4 w-4 text-cyan-500/70" />
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-600">Deadline</span>
                                <span className="text-xs font-mono font-bold text-white/90">{formatDate(assignment.dueDate)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-slate-400">
                            <FileText className="h-4 w-4 text-purple-500/70" />
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-600">Weightage</span>
                                <span className="text-xs font-mono font-bold text-white/90">{assignment.points} Points</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isPending && onSuccess ? (
                            <SubmitAssignmentModal
                                assignment={assignment}
                                onSuccess={onSuccess}
                                trigger={
                                    <Button className="bg-[var(--school-accent)] hover:bg-blue-600 text-white font-bold px-6 shadow-lg shadow-blue-500/20 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all">
                                        <UploadCloud className="h-4 w-4 mr-2" />
                                        Turn In Work
                                    </Button>
                                }
                            />
                        ) : (
                            <Button
                                variant="outline"
                                className="bg-transparent border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                onClick={() => {
                                    if (isGraded && onViewFeedback) {
                                        onViewFeedback()
                                    } else {
                                        toast.info("Detailed feedback review coming soon")
                                    }
                                }}
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                {isGraded ? "View Feedback" : "View Submission"}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-slate-900/50">
            <CheckCircle2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">{message}</p>
        </div>
    )
}
