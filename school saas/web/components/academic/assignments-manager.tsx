"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, MoreVertical, Plus, AlertTriangle, Loader2 } from "lucide-react"
import { Assignment } from "@/types/assignments"
import { CreateAssignmentModal } from "./create-assignment-modal"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { SubmissionsView } from "./submissions-view"

interface AssignmentsManagerProps {
    classId: string
    subjectId: string
    assignments: Assignment[]
}

export function AssignmentsManager({ classId, subjectId, assignments = [] }: AssignmentsManagerProps) {
    const [viewingSubmissions, setViewingSubmissions] = useState<Assignment | null>(null)
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
    const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deletingAssignment) return

        setIsDeleting(true)
        try {
            const { deleteAssignment } = await import("@/lib/actions/assignments")
            const res = await deleteAssignment(deletingAssignment.id)
            if (res.success) {
                toast.success("Assignment deleted")
                setDeletingAssignment(null)
            } else {
                toast.error(res.error || "Failed to delete")
            }
        } catch (err) {
            console.error(err)
            toast.error("An error occurred")
        } finally {
            setIsDeleting(false)
        }
    }

    if (assignments.length === 0) {
        // ... existing empty state ...
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/10 rounded-xl bg-slate-900/50">
                <div className="bg-blue-500/10 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Assignments Yet</h3>
                <p className="text-slate-400 max-w-sm mb-6">
                    Create manually graded assignments for homework, projects, or presentations.
                </p>
                <CreateAssignmentModal classId={classId} subjectId={subjectId} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Active Assignments</h3>
                <CreateAssignmentModal
                    classId={classId}
                    subjectId={subjectId}
                    trigger={
                        <Button className="bg-[var(--school-accent)] text-white">
                            <Plus className="h-4 w-4 mr-2" /> New Assignment
                        </Button>
                    }
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map((assignment) => (
                    <Card key={assignment.id} className="bg-slate-900 border-white/5 p-6 hover:border-blue-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-400" />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-950 border-white/10 text-slate-300">
                                    <DropdownMenuItem onClick={() => setEditingAssignment(assignment)}>
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setViewingSubmissions(assignment)}>
                                        View Submissions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                        onClick={() => setDeletingAssignment(assignment)}
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <h4 className="text-lg font-semibold text-white mb-2 line-clamp-1">{assignment.title}</h4>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2 h-10">
                            {assignment.description || "No description provided."}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                {assignment.due_date
                                    ? format(new Date(assignment.due_date), "MMM d, yyyy")
                                    : "No due date"}
                            </div>
                            <div className="font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                                {assignment.points} pts
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Edit Modal */}
            {editingAssignment && (
                <CreateAssignmentModal
                    classId={classId}
                    subjectId={subjectId}
                    initialData={editingAssignment}
                    isOpen={!!editingAssignment}
                    onClose={() => setEditingAssignment(null)}
                />
            )}

            {viewingSubmissions && (
                <SubmissionsView
                    assignmentId={viewingSubmissions.id}
                    assignmentTitle={viewingSubmissions.title}
                    maxPoints={viewingSubmissions.points}
                    isOpen={!!viewingSubmissions}
                    onClose={() => setViewingSubmissions(null)}
                />
            )}

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deletingAssignment} onOpenChange={(open) => !open && setDeletingAssignment(null)}>
                <AlertDialogContent className="bg-slate-950 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Delete Assignment?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete <span className="font-bold text-white">{deletingAssignment?.title}</span>? This action cannot be undone and all student submissions will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white border-none"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Assignment"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
