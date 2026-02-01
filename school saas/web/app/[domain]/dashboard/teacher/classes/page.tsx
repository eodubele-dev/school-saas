"use client"

import { getTeacherClasses, getClassRoster, TeacherClass, StudentRosterItem } from "@/lib/actions/classes"
import { ClassCard } from "@/components/dashboard/class-card"
import { StudentRoster } from "@/components/dashboard/student-roster"
import { Users, LayoutGrid, List } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function MyClassesPage() {
    const [classes, setClasses] = useState<TeacherClass[]>([])
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
    const [roster, setRoster] = useState<StudentRosterItem[]>([])
    const [loadingRoster, setLoadingRoster] = useState(false)
    const [loadingClasses, setLoadingClasses] = useState(true)

    // 1. Initial Fetch of Classes
    useEffect(() => {
        async function loadClasses() {
            try {
                const res = await getTeacherClasses()
                if (res.success && res.data) {
                    setClasses(res.data)
                    // Auto-select first class if available for better UX
                    if (res.data.length > 0) {
                        handleClassSelect(res.data[0].id)
                    }
                }
            } catch (e) {
                toast.error("Failed to load classes")
            } finally {
                setLoadingClasses(false)
            }
        }
        loadClasses()
    }, [])

    // 2. Fetch Roster when Class ID changes
    const handleClassSelect = async (classId: string) => {
        if (classId === selectedClassId) return // Already selected

        setSelectedClassId(classId)
        setLoadingRoster(true)

        // Context Injection (Simulation)
        // In a real app with global state (Zustand/Context), we would dispatch here:
        // setGlobalActiveContext({ type: 'class', id: classId })

        try {
            const res = await getClassRoster(classId)
            if (res.success && res.data) {
                setRoster(res.data)
            } else {
                setRoster([])
            }
        } catch (e) {
            toast.error("Failed to load student list")
        } finally {
            setLoadingRoster(false)
        }
    }

    const selectedClass = classes.find(c => c.id === selectedClassId)

    return (
        <div className="h-[calc(100vh-80px)] p-6 md:p-8 flex flex-col animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-[var(--school-accent)]/10 p-2.5 rounded-lg border border-[var(--school-accent)]/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                    <Users className="h-6 w-6 text-[var(--school-accent)]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">My Classes Hub</h1>
                    <p className="text-slate-400 text-xs mt-0.5">Manage your students, view rosters, and checks alerts.</p>
                </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* Left Panel: Class Selection Grid */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" /> Available Classes
                    </h3>

                    {loadingClasses ? (
                        <div className="text-slate-500 text-sm p-4">Loading classes...</div>
                    ) : (
                        <div className="space-y-4">
                            {classes.map(c => (
                                <ClassCard
                                    key={c.id}
                                    classItem={c}
                                    isSelected={selectedClassId === c.id}
                                    onClick={() => handleClassSelect(c.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: Active Roster */}
                <div className="lg:col-span-8 flex flex-col">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <List className="h-4 w-4" />
                            {selectedClass ? `Roster: ${selectedClass.name}` : 'Student Roster'}
                        </h3>
                        {selectedClass?.role === 'form_teacher' && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-bold uppercase">
                                Form Teacher View
                            </span>
                        )}
                    </div>

                    <div className="flex-1 min-h-0 bg-slate-900/30 rounded-xl border border-white/5 overflow-hidden shadow-2xl relative">
                        {loadingRoster ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="animate-pulse text-slate-500">Loading roster...</span>
                            </div>
                        ) : selectedClassId ? (
                            <StudentRoster students={roster} className="h-full border-0" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50 p-8 text-center">
                                <Users className="h-16 w-16 mb-4" />
                                <p>Select a class from the left to view the student list.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
