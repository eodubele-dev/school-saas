"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, UserCircle, Plus, LayoutDashboard, Search, FileText } from "lucide-react"

import { MilestoneForm } from "./milestone-form"
import { CurriculumManagerContent } from "./curriculum-manager-content"

interface CurriculumManagerProps {
    initialStudents: any[]
    initialMilestones: any[]
}

export function CurriculumManagerClient({
    initialStudents,
    initialMilestones
}: CurriculumManagerProps) {
    const [students] = useState(initialStudents)
    const [milestones, setMilestones] = useState(initialMilestones)

    // UI State
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingMilestone, setEditingMilestone] = useState<any | null>(null)

    const filteredStudents = students.filter(s =>
        (s.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admission_number?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedStudent = students.find(s => s.id === selectedStudentId)
    const studentMilestones = milestones.filter(m => m.student_id === selectedStudentId)

    const handleOpenCreate = () => {
        if (!selectedStudentId) return; // shouldn't happen based on button disabled state
        setEditingMilestone(null)
        setIsFormOpen(true)
    }

    const handleOpenEdit = (milestone: any) => {
        setEditingMilestone(milestone)
        setIsFormOpen(true)
    }

    const handleMilestoneSuccess = (action: 'create' | 'update' | 'delete', data?: any, id?: string) => {
        if (action === 'create' && data) {
            setMilestones(prev => [data, ...prev])
        } else if (action === 'update' && data) {
            setMilestones(prev => prev.map(m => m.id === data.id ? data : m))
        } else if (action === 'delete' && id) {
            setMilestones(prev => prev.filter(m => m.id !== id))
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 relative z-10">
            {/* LEFT SIDEBAR: Student Select */}
            <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
                <Card className="bg-[#0A0A0B]/80 backdrop-blur-xl border-white/10 sticky top-8 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent pointer-events-none" />
                    <div className="p-4 border-b border-white/5 relative z-10">
                        <h3 className="font-black text-white mb-4 flex items-center gap-2 uppercase tracking-widest text-sm">
                            <UserCircle className="text-yellow-400" size={18} />
                            Select Student
                        </h3>
                        <div className="relative group">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-yellow-500/50 group-focus-within:text-yellow-400 transition-colors" />
                            <Input
                                placeholder="Search by name or ID..."
                                className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="h-[600px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 relative z-10 custom-scrollbar">
                        {filteredStudents.length > 0 ? (
                            <div className="space-y-1">
                                {filteredStudents.map((student) => (
                                    <button
                                        key={student.id}
                                        onClick={() => setSelectedStudentId(student.id)}
                                        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${selectedStudentId === student.id
                                            ? 'bg-yellow-500/20 border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
                                            : 'hover:bg-yellow-500/5 border border-transparent'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-lg ${selectedStudentId === student.id ? 'bg-yellow-600 border-yellow-400 shadow-yellow-500/30' : 'bg-slate-900 border-white/10'
                                            }`}>
                                            <span className={`text-sm font-bold ${selectedStudentId === student.id ? 'text-white' : 'text-slate-400'}`}>
                                                {student.full_name?.charAt(0) || 'S'}
                                            </span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className={`text-sm font-bold truncate tracking-tight ${selectedStudentId === student.id ? 'text-yellow-50' : 'text-slate-200'}`}>
                                                {student.full_name}
                                            </p>
                                            <p className={`text-[10px] uppercase tracking-widest font-mono truncate ${selectedStudentId === student.id ? 'text-yellow-300' : 'text-slate-500'}`}>
                                                {student.admission_number || 'N/A'} • {student.classes?.name || 'No Class'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-slate-500 text-sm">
                                No students found.
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* RIGHT MAIN: Curriculum Editor */}
            <div className="flex-1 min-w-0">
                {!selectedStudentId ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-[#0A0A0B]/50 backdrop-blur-sm p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
                        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)] border border-red-500/30">
                            <BookOpen className="text-red-400" size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tight relative z-10">No Student Selected</h2>
                        <p className="text-slate-400 max-w-sm relative z-10">Select a student from the directory to view and manage their personalized curriculum roadmap.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A0A0B]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-blue-500/5 to-transparent pointer-events-none" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                                    <FileText className="text-white drop-shadow-md" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight">{selectedStudent?.full_name?.split(' ')[0]}'s Roadmap</h2>
                                    <p className="text-blue-400 text-sm font-semibold tracking-wide uppercase">{studentMilestones.length} milestones tracked</p>
                                </div>
                            </div>

                            <Button
                                onClick={handleOpenCreate}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] relative z-10 rounded-xl px-6 py-6 text-md border border-red-400/50 hover:scale-105 transition-all"
                            >
                                <Plus className="mr-2 h-5 w-5 font-black" /> Add Milestone
                            </Button>
                        </div>

                        <CurriculumManagerContent
                            milestones={studentMilestones}
                            onEdit={handleOpenEdit}
                        />
                    </div>
                )}
            </div>

            {/* MODAL */}
            {isFormOpen && selectedStudentId && (
                <MilestoneForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    studentId={selectedStudentId}
                    initialData={editingMilestone}
                    onSuccess={handleMilestoneSuccess}
                />
            )}
        </div>
    )
}
