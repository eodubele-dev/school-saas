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
import { useState, useMemo } from "react"

interface StudentRosterProps {
    students: StudentRosterItem[]
    className?: string
}

export function StudentRoster({ students, className }: StudentRosterProps) {
    const [search, setSearch] = useState("")

    const filteredStudents = useMemo(() => {
        return students.filter(s =>
            s.full_name.toLowerCase().includes(search.toLowerCase()) ||
            s.admission_number.toLowerCase().includes(search.toLowerCase())
        )
    }, [students, search])

    return (
        <Card className={`bg-slate-900 border-white/10 overflow-hidden flex flex-col ${className}`}>
            {/* Header / Actions */}
            <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/50">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search roster..."
                        className="pl-9 bg-slate-950 border-white/10 h-9 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9 border-white/10 text-slate-400 hover:text-white">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </Button>
                    <Button size="sm" className="h-9 bg-[var(--school-accent)] hover:bg-[var(--school-accent)]/90 text-white">
                        Export List
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950/50 text-slate-500 font-medium border-b border-white/5 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 px-6 w-16">Profile</th>
                            <th className="p-4">Student Name</th>
                            <th className="p-4">Admission No.</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Alerts</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredStudents.map(student => (
                            <tr key={student.id} className="hover:bg-white/5 group transition-colors">
                                <td className="p-4 px-6">
                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                                        {student.avatar_url ? (
                                            <img src={student.avatar_url} alt={student.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5 text-slate-500" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-slate-200">{student.full_name}</div>
                                </td>
                                <td className="p-4 text-slate-500 font-mono text-xs">
                                    {student.admission_number}
                                </td>
                                <td className="p-4">
                                    <Badge variant="outline" className={
                                        student.status === 'active' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10" : "border-slate-700 text-slate-500"
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
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-[var(--school-accent)]">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-white">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No students found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-950/30 text-xs text-slate-500 flex justify-between items-center">
                <span>Showing {filteredStudents.length} of {students.length} students</span>
            </div>
        </Card>
    )
}
