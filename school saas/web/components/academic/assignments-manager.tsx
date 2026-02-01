"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

export function AssignmentsManager() {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/10 rounded-xl bg-slate-900/50">
            <div className="bg-blue-500/10 p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Assignments Yet</h3>
            <p className="text-slate-400 max-w-sm mb-6">
                Create manually graded assignments for homework, projects, or presentations.
            </p>
            <Button className="bg-[var(--school-accent)] text-white">
                <Plus className="h-4 w-4 mr-2" /> Create Assignment
            </Button>
        </div>
    )
}
