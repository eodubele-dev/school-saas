"use client"

import { Card } from "@/components/ui/card"
import { Folder, BookOpen, ChevronRight } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useState } from "react"
import { LessonViewer } from "./lesson-viewer"
import { getSubjectLessons } from "@/lib/actions/student-learning"
import { toast } from "sonner"

export function SubjectFolders({ subjects }: { subjects: any[] }) {
    const [selectedSubject, setSelectedSubject] = useState<any>(null)
    const [lessons, setLessons] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [activeLesson, setActiveLesson] = useState<any>(null)

    const handleOpenSubject = async (sub: any) => {
        setSelectedSubject(sub)
        setLoading(true)
        try {
            const res = await getSubjectLessons(sub.name)
            if (res.success) {
                setLessons(res.lessons)
            }
        } catch (e) {
            toast.error("Failed to load notes")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Folder className="h-5 w-5 text-[var(--school-accent)]" />
                My Subjects (Digital Locker)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {subjects.map((sub, idx) => (
                    <Card
                        key={idx}
                        onClick={() => handleOpenSubject(sub)}
                        className="group relative overflow-hidden bg-slate-900 border-white/5 hover:border-[var(--school-accent)] transition-all cursor-pointer h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <div className={`absolute top-0 w-full h-1 ${sub.color || 'bg-blue-500'}`} />
                        <Folder className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors" />
                        <div className="text-center">
                            <h4 className="text-sm font-bold text-white group-hover:text-[var(--school-accent)]">{sub.name}</h4>
                            <span className="text-[10px] text-slate-500">{sub.lessonCount} Notes</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Subject Drawer */}
            <Sheet open={!!selectedSubject} onOpenChange={(o) => !o && setSelectedSubject(null)}>
                <SheetContent className="w-full sm:max-w-xl bg-slate-950 border-l border-white/10 text-white overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-white flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-[var(--school-accent)]" />
                            {selectedSubject?.name} Notes
                        </SheetTitle>
                    </SheetHeader>

                    {activeLesson ? (
                        <LessonViewer lesson={activeLesson} onBack={() => setActiveLesson(null)} />
                    ) : (
                        <div className="space-y-2">
                            {loading ? (
                                <div className="text-center py-8 text-slate-500">Loading notes...</div>
                            ) : lessons.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No notes published yet.</div>
                            ) : (
                                lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        onClick={() => setActiveLesson(lesson)}
                                        className="flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-white/5 hover:bg-slate-800 cursor-pointer transition-colors"
                                    >
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 rounded bg-white/5 flex items-center justify-center text-slate-400 font-mono text-xs">
                                                wk{lesson.week || 1}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-white">{lesson.topic}</h4>
                                                <p className="text-xs text-slate-400 line-clamp-1">{lesson.subtopics || "No description"}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-slate-600" />
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
