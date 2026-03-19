"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Search, User, Phone, Activity, AlertTriangle,
    MoreHorizontal, Filter
} from "lucide-react"
import { StudentRosterItem } from "@/lib/actions/classes"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useState, useMemo } from "react"
import { StudentEvaluationModal } from "../teacher/results/student-evaluation-modal"

interface StudentRosterProps {
    students: StudentRosterItem[]
    className?: string
    classId?: string
}

export function StudentRoster({ students, className, classId }: StudentRosterProps) {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string | null>(null)
    const [evalStudent, setEvalStudent] = useState<{ id: string, name: string } | null>(null)

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            const matchesSearch = s.full_name.toLowerCase().includes(search.toLowerCase()) ||
                s.admission_number.toLowerCase().includes(search.toLowerCase())
            const matchesFilter = statusFilter ? s.status === statusFilter : true
            return matchesSearch && matchesFilter
        })
    }, [students, search, statusFilter])

    const handleExport = () => {
        if (filteredStudents.length === 0) {
            toast.error("No data to export")
            return
        }

        const headers = ["Full Name", "Admission Number", "Status", "Financial Status"]
        const csvContent = [
            headers.join(","),
            ...filteredStudents.map(s => [
                `"${s.full_name}"`,
                `"${s.admission_number}"`,
                `"${s.status}"`,
                `"${s.financial_status}"`
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `student_roster_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("Roster exported successfully", {
            description: `${filteredStudents.length} students exported to CSV.`
        })
    }

    return (
        <Card className={`bg-card text-card-foreground border-border overflow-hidden flex flex-col ${className}`}>
            {/* Header / Actions */}
            <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-card text-card-foreground/50">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by name or ID..."
                        className="pl-9 bg-white/[0.03] text-white border-white/5 h-10 text-sm placeholder:text-slate-600 focus:ring-1 focus:ring-blue-500/50 transition-all rounded-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`h-10 px-4 rounded-full border border-white/5 text-slate-400 hover:bg-white/5 hover:text-white transition-all ${statusFilter ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}`}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                {statusFilter ? `Status: ${statusFilter}` : 'Filter'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0B0F1A] text-slate-300 border-white/5">
                            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Students</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active Only</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>Inactive Only</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter('graduated')}>Graduated</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        size="sm"
                        onClick={handleExport}
                        className="h-10 px-6 rounded-full bg-blue-600 text-white hover:bg-blue-500 font-bold transition-all active:scale-95 shadow-lg border-none"
                    >
                        Export List
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.02] text-slate-500 font-bold border-b border-white/5 sticky top-0 z-10 uppercase tracking-widest text-[10px]">
                        <tr>
                            <th className="p-5 px-8 w-20">Profile</th>
                            <th className="p-5">Student Name</th>
                            <th className="p-5">Admission No.</th>
                            <th className="p-5">Status</th>
                            <th className="p-5">Alerts</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-white/[0.01] group transition-colors">
                                <td className="p-4 px-8">
                                    <div className="h-12 w-12 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border border-white/5">
                                        {student.avatar_url ? (
                                            <img src={student.avatar_url} alt={student.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-6 w-6 text-slate-600" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-200 text-base">{student.full_name}</div>
                                </td>
                                <td className="p-4 text-muted-foreground font-mono text-xs">
                                    {student.admission_number}
                                </td>
                                <td className="p-4">
                                    <Badge variant="outline" className={
                                        student.status === 'active' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10" : "border-slate-700 text-muted-foreground"
                                    }>
                                        {student.status}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {student.medical_info?.conditions && student.medical_info.conditions.length > 0 && (
                                            <div className="h-7 w-7 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500" title={`Medical: ${student.medical_info.conditions.join(', ')}`}>
                                                <Activity className="h-3.5 w-3.5" />
                                            </div>
                                        )}
                                        {student.financial_status === 'owing' && (
                                            <div className="h-7 w-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500" title="Fees Outstanding">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                                            onClick={() => {
                                                if (student.parent_phone) {
                                                    toast.info(`Contact Parent: ${student.parent_name || 'Guardian'}`, {
                                                        description: `Phone: ${student.parent_phone}`,
                                                        action: {
                                                            label: "Copy",
                                                            onClick: () => {
                                                                navigator.clipboard.writeText(student.parent_phone!)
                                                                toast.success("Phone number copied!")
                                                            }
                                                        }
                                                    })
                                                } else {
                                                    toast.error("No contact info available for this student.")
                                                }
                                            }}
                                        >
                                            <Phone className="h-4 w-4" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-card text-card-foreground border-border text-slate-300 w-48">
                                                <DropdownMenuItem
                                                    onClick={() => window.location.href = `/dashboard/teacher/behavior?studentId=${student.id}`}
                                                    className="cursor-pointer"
                                                >
                                                    <Activity className="h-4 w-4 mr-2 text-rose-500" />
                                                    Log Behavior
                                                </DropdownMenuItem>
                                                {classId && (
                                                    <DropdownMenuItem
                                                        onClick={() => setEvalStudent({ id: student.id, name: student.full_name })}
                                                        className="cursor-pointer font-semibold text-emerald-400 focus:text-emerald-300"
                                                    >
                                                        <div className="h-4 w-4 mr-2 border border-emerald-500 text-emerald-500 rounded flex items-center justify-center text-[10px] font-bold">R</div>
                                                        End of Term Eval
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        const notes = student.medical_info?.notes || "No medical notes on file."
                                                        toast("Medical Records", { description: notes })
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                                    Medical Notes
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => window.location.href = classId ? `/dashboard/teacher/assessments?class_id=${classId}` : `/dashboard/teacher/assessments`}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="h-4 w-4 mr-2 border border-blue-500 text-blue-500 rounded flex items-center justify-center text-[10px] font-bold">G</div>
                                                    Enter Grades
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                    No students found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-border/50 bg-slate-950/30 text-xs text-muted-foreground flex justify-between items-center">
                <span>Showing {filteredStudents.length} of {students.length} students</span>
            </div>

            {/* End of Term Result Evaluation Modal */}
            {classId && evalStudent && (
                <StudentEvaluationModal
                    isOpen={!!evalStudent}
                    onClose={() => setEvalStudent(null)}
                    studentId={evalStudent.id}
                    studentName={evalStudent.name}
                    classId={classId}
                />
            )}
        </Card>
    )
}
