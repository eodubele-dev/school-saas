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
                if (res.success && res.data && res.data.length > 0) {
                    setClasses(res.data)
                    // Auto-load the roster for the first class
                    await loadRoster(res.data[0].id)
                } else {
                    setClasses([])
                }
            } catch (e) {
                toast.error("Failed to load classes")
            } finally {
                setLoadingClasses(false)
            }
        }
        loadClasses()
    }, [])

    // Core roster loader — used by both auto-select and manual click
    const loadRoster = async (classId: string) => {
        setSelectedClassId(classId)
        setLoadingRoster(true)
        try {
            const res = await getClassRoster(classId)
            if (res.success && res.data) {
                setRoster(res.data)
            } else {
                setRoster([])
                console.warn('[Roster] No students returned for class:', classId)
            }
        } catch (e) {
            toast.error("Failed to load student list")
            setRoster([])
        } finally {
            setLoadingRoster(false)
        }
    }

    // 2. Manual class selection — always re-fetches even if same class
    const handleClassSelect = async (classId: string) => {
        await loadRoster(classId)
    }

    const selectedClass = classes.find(c => c.id === selectedClassId)

    return (
        <div className="min-h-screen lg:h-[calc(100vh-80px)] p-4 md:p-8 flex flex-col animate-in fade-in duration-700 pb-24 lg:pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 md:mb-8">
                <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 shadow-lg">
                    <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">My Classes Hub</h1>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1 opacity-70">
                        Academic Command Center
                    </p>
                </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-8 min-h-0">
                {/* Left Panel: Class Selection (Horizontal on Mobile, Vertical on Desktop) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <LayoutGrid className="h-3.5 w-3.5" /> 
                            Available Classes
                        </h3>
                        {classes.length > 1 && (
                            <span className="lg:hidden text-[10px] text-slate-600 font-bold animate-pulse">
                                Swipe →
                            </span>
                        )}
                    </div>

                    <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 scrollbar-hide snap-x">
                        {loadingClasses ? (
                            <div className="text-slate-500 text-sm p-4 animate-pulse font-mono uppercase tracking-widest">
                                Syncing Classes...
                            </div>
                        ) : (
                            classes.map(c => (
                                <div key={c.id} className="min-w-[280px] lg:min-w-full snap-center">
                                    <ClassCard
                                        classItem={c}
                                        isSelected={selectedClassId === c.id}
                                        onClick={() => handleClassSelect(c.id)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Active Roster */}
                <div className="lg:col-span-8 flex flex-col min-h-0">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <List className="h-3.5 w-3.5" />
                            {selectedClass ? `Roster: ${selectedClass.name}` : 'Student Roster'}
                        </h3>
                        {selectedClass?.role === 'form_teacher' && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 font-black uppercase tracking-wider">
                                Form Teacher View
                            </span>
                        )}
                    </div>

                    <div className="flex-1 min-h-[500px] lg:min-h-0 bg-[#0f172a]/40 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl relative">
                        {loadingRoster ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm z-20">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Loading Roster...</span>
                                </div>
                            </div>
                        ) : selectedClassId ? (
                            <StudentRoster students={roster} classId={selectedClassId} className="h-full border-0" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 p-12 text-center">
                                <Users className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Select a class to view roster</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
