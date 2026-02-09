"use client"

import { useState, useEffect } from "react"
import { FileText, Calendar, CheckCircle2, Clock, ChevronRight, UploadCloud, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubmitAssignmentModal } from "./submit-assignment-modal"
import { toast } from "sonner"
import { getStudentAssignments } from "@/lib/actions/assignments"

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
}

export function AssignmentList() {
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAssignments = async () => {
        setLoading(true)
        try {
            const { success, data, error } = await getStudentAssignments()
            if (success && data) {
                // Map DB keys to frontend keys if needed (though we tried to match in action)
                // The action returns snake_case keys for DB columns but we merged them.
                // Let's verify the shape in action. 
                // The action returns: { ...a, subject: string, teacher: string, status: ..., due_date: ... }
                // We need to map `due_date` to `dueDate`.

                const mapped = data.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    subject: d.subject,
                    teacher: d.teacher,
                    dueDate: d.due_date,
                    status: d.status,
                    points: d.points,
                    description: d.description,
                    submittedDate: d.submittedDate,
                    grade: d.grade
                }))
                setAssignments(mapped)
            } else {
                console.error("Failed to fetch assignments:", error)
                // Optionally keep mock data if fetch fails for demo?
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssignments()
    }, [])

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
                        <AssignmentCard key={assignment.id} assignment={assignment} />
                    ))}
                    {assignments.filter(a => a.status === 'graded').length === 0 && (
                        <EmptyState message="No graded assignments yet." />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function AssignmentCard({ assignment, onSuccess }: { assignment: any, onSuccess?: () => void }) {
    const isPending = assignment.status === 'pending'
    const isGraded = assignment.status === 'graded'

    return (
        <Card className="bg-slate-900 border-white/5 hover:border-[var(--school-accent)]/50 transition-colors">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 border-white/10 text-slate-400">
                            {assignment.subject}
                        </Badge>
                        <CardTitle className="text-white text-lg">{assignment.title}</CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                            {assignment.teacher}
                        </CardDescription>
                    </div>
                    {isGraded ? (
                        <div className="text-right">
                            <span className="text-2xl font-bold text-green-400">{assignment.grade}/{assignment.points}</span>
                            <p className="text-xs text-slate-500">Score</p>
                        </div>
                    ) : (
                        <Badge className={`${isPending ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'} border-0`}>
                            {isPending ? 'Due Soon' : 'Submitted'}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            <span>{assignment.points} Pts</span>
                        </div>
                    </div>

                    {isPending && onSuccess ? (
                        <SubmitAssignmentModal
                            assignment={assignment}
                            onSuccess={onSuccess}
                            trigger={
                                <Button size="sm" className="bg-[var(--school-accent)] hover:bg-blue-600 text-white">
                                    <UploadCloud className="h-4 w-4 mr-2" />
                                    Submit
                                </Button>
                            }
                        />
                    ) : (
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
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
