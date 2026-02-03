"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, MoreVertical, Plus } from "lucide-react"
import { Assignment } from "@/types/assignments"
import { CreateAssignmentModal } from "./create-assignment-modal"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AssignmentsManagerProps {
    classId: string
    subjectId: string
    assignments: Assignment[]
}

export function AssignmentsManager({ classId, subjectId, assignments = [] }: AssignmentsManagerProps) {
    if (assignments.length === 0) {
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
                    <Card key={assignment.id} className="bg-slate-900/50 border-white/5 p-6 hover:border-blue-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-400" />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-950 border-white/10 text-slate-300">
                                    <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                    <DropdownMenuItem>View Submissions</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
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
        </div>
    )
}
