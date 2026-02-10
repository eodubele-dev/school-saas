"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, UserPlus } from "lucide-react"
import { getAllStudents } from "@/lib/actions/student-management"

export function AllocationModal({ isOpen, onClose, onConfirm }: {
    isOpen: boolean
    onClose: () => void
    onConfirm: (studentId: string) => void
}) {
    const [search, setSearch] = useState("")
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            getAllStudents().then(data => {
                setStudents(data)
                setLoading(false)
            })
        }
    }, [isOpen])

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Student to Bunk</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search student name or ID..."
                            className="pl-10 bg-black/40 border-white/10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                        {loading ? (
                            <p className="text-center text-slate-500 py-4">Loading students...</p>
                        ) : filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-[var(--school-accent)]/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-bold text-sm">{student.name}</p>
                                        <p className="text-xs text-slate-400">{student.admissionNo} • {student.class}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                        onClick={() => onConfirm(student.id)}
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Assign
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-4">No students found matching "{search}"</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
