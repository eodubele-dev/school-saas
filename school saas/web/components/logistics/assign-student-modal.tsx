"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    assignStudentToRoute,
    removeStudentAssignment,
    getRouteAssignments
} from "@/lib/actions/logistics"
import { getAllStudents } from "@/lib/actions/student-management"
import { toast } from "sonner"
import { UserPlus, Search, Trash2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface Student {
    id: string
    name: string
    admissionNo: string
}

interface Assignment {
    id: string
    student_id: string
    stop_location: string
    student: {
        first_name: string
        last_name: string
        admission_number: string
    }
}

export function AssignStudentModal({ routeId, routeName }: { routeId: string, routeName: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [allStudents, setAllStudents] = useState<Student[]>([])
    const [assignments, setAssignments] = useState<Assignment[]>([])
    const [assigningStudentId, setAssigningStudentId] = useState<string | null>(null)
    const [stopLocation, setStopLocation] = useState("")
    const router = useRouter()

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    async function fetchData() {
        setLoading(true)
        const [studentsData, assignmentsData] = await Promise.all([
            getAllStudents(),
            getRouteAssignments(routeId)
        ])
        setAllStudents(studentsData as any)
        setAssignments(assignmentsData as any)
        setLoading(false)
    }

    const filteredStudents = allStudents.filter(s =>
        !assignments.some(a => a.student_id === s.id) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.admissionNo.toLowerCase().includes(search.toLowerCase()))
    )

    const handleAssign = async (studentId: string) => {
        if (loading) return
        setLoading(true)

        try {
            const res = await assignStudentToRoute({
                routeId: routeId,
                studentId: studentId,
                stopLocation: stopLocation || ""
            })

            if (res.success) {
                toast.success("Student assigned")
                setAssigningStudentId(null)
                setStopLocation("")
                await fetchData()
                // Small delay to allow React to settle before router refresh
                setTimeout(() => router.refresh(), 100)
            } else {
                toast.error(res.error || "Failed to assign student")
            }
        } catch (err) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleRemove = async (assignmentId: string) => {
        if (loading) return
        setLoading(true)

        try {
            const res = await removeStudentAssignment(assignmentId)

            if (res.success) {
                toast.success("Student removed")
                await fetchData()
                setTimeout(() => router.refresh(), 100)
            } else {
                toast.error(res.error || "Failed to remove student")
            }
        } catch (err) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-slate-800 border-white/10 hover:bg-slate-700 text-white hover:!text-white gap-2 transition-colors">
                    <UserPlus className="h-4 w-4" /> Manage
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-white/10 text-white sm:max-w-[500px] max-h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Manage Students: {routeName}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Current Assignments */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currently Assigned ({assignments.length})</h4>
                        <div className="space-y-2">
                            {assignments.map(a => (
                                <div key={a.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-900 border border-white/5">
                                    <div>
                                        <div className="font-medium text-sm">{a.student.first_name} {a.student.last_name}</div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {a.stop_location || 'Default Route Stop'}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                        onClick={() => handleRemove(a.id)}
                                        disabled={loading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {assignments.length === 0 && (
                                <div className="text-sm text-slate-600 italic">No students assigned yet.</div>
                            )}
                        </div>
                    </div>

                    {/* Search & Add */}
                    <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assign New Student</h4>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search students by name or admission number..."
                                className="pl-9 bg-slate-900 border-white/10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredStudents.map(s => {
                                const isSelected = assigningStudentId === s.id
                                return (
                                    <div key={s.id} className={cn(
                                        "p-2 rounded-lg transition-all border",
                                        isSelected ? "bg-cyan-500/10 border-cyan-500/30" : "hover:bg-white/5 border-transparent hover:border-white/5"
                                    )}>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm">
                                                <div className="font-medium">{s.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{s.admissionNo}</div>
                                            </div>
                                            {isSelected ? (
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    setAssigningStudentId(null)
                                                    setStopLocation("")
                                                }} className="text-slate-400">Cancel</Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
                                                    onClick={() => {
                                                        setAssigningStudentId(s.id)
                                                        setStopLocation("")
                                                    }}
                                                    disabled={loading}
                                                >
                                                    Select
                                                </Button>
                                            )}
                                        </div>

                                        {isSelected ? (
                                            <div className="mt-3 space-y-2 p-3 bg-slate-950/50 rounded-lg border border-white/5 animate-in fade-in zoom-in-95 duration-200">
                                                <Label className="text-[10px] uppercase text-slate-500">Confirm Stop Location</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="e.g. Admiralty Way, Gate 2"
                                                        className="h-8 text-xs bg-slate-900 border-white/10"
                                                        value={stopLocation}
                                                        onChange={(e) => setStopLocation(e.target.value)}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-4"
                                                        onClick={() => handleAssign(s.id)}
                                                        disabled={loading}
                                                    >
                                                        {loading ? "..." : "Add"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )
                            })}
                            {search && filteredStudents.length === 0 && (
                                <div className="text-sm text-slate-600 text-center py-4">No matching students found or already assigned.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                    <Button variant="ghost" className="w-full text-slate-400" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
