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
            <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                <Folder className="h-5 w-5 text-[var(--school-accent)]" />
                My Subjects (Digital Locker)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {subjects.map((sub, idx) => (
                    <Card
                        key={idx}
                        onClick={() => handleOpenSubject(sub)}
                        className="group relative overflow-hidden bg-card text-card-foreground border-border/50 hover:border-[var(--school-accent)] transition-all cursor-pointer h-32 flex flex-col items-center justify-center gap-3"
                    >
                        <div className={`absolute top-0 w-full h-1 ${sub.color || 'bg-blue-500'}`} />
                        <Folder className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <div className="text-center">
                            <h4 className="text-sm font-bold text-foreground group-hover:text-[var(--school-accent)]">{sub.name}</h4>
                            <span className="text-[10px] text-muted-foreground">{sub.lessonCount} Notes</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Subject Drawer */}
            <Sheet open={!!selectedSubject} onOpenChange={(o) => {
                if (!o) {
                    setSelectedSubject(null)
                    setActiveLesson(null)
                }
            }}>
                <SheetContent className="w-full sm:max-w-[1200px] bg-slate-950 border-l border-border text-foreground overflow-y-auto p-0 flex flex-col">
                    {!activeLesson && (
                        <SheetHeader className="p-8 border-b border-border/50">
                            <SheetTitle className="text-foreground flex items-center gap-2 text-2xl">
                                <BookOpen className="h-6 w-6 text-[var(--school-accent)]" />
                                {selectedSubject?.name}
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground">
                                Browse and read your published notes for this subject.
                            </SheetDescription>
                        </SheetHeader>
                    )}

                    <div className="flex-1 overflow-hidden">
                        {activeLesson ? (
                            <div className="h-full p-4 md:p-8">
                                <LessonViewer lesson={activeLesson} onBack={() => setActiveLesson(null)} />
                            </div>
                        ) : (
                            <div className="p-8 space-y-3">
                                {loading ? (
                                    <div className="text-center py-8 text-muted-foreground">Loading notes...</div>
                                ) : lessons.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">No notes published yet.</div>
                                ) : (
                                    lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            onClick={() => setActiveLesson(lesson)}
                                            className="flex items-center justify-between p-4 rounded-lg bg-card text-card-foreground border border-border/50 hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <div className="flex gap-4">
                                                <div className="h-10 w-10 rounded bg-secondary/50 flex items-center justify-center text-muted-foreground font-mono text-xs">
                                                    wk{lesson.week || 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-foreground">{lesson.title}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {lesson.topics && lesson.topics.length > 0
                                                            ? lesson.topics.join(", ")
                                                            : "No description available"}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-600" />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
