"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createLesson } from "@/lib/actions/teacher-lesson-publisher"
import { Plus, BookOpen, Save } from "lucide-react"

export function TeacherLessonPublisher({ classId, subject }: { classId?: string, subject?: string }) {
    const [title, setTitle] = useState("")
    const [week, setWeek] = useState("1")
    const [content, setContent] = useState("")
    const [subtopics, setSubtopics] = useState("")
    const [loading, setLoading] = useState(false)

    async function handlePublish() {
        if (!title || !content || !subject) {
            toast.error("Please fill in all required fields")
            return
        }

        setLoading(true)
        try {
            const res = await createLesson({
                title,
                content,
                subject,
                grade_level: "Grade 2", // TODO: Get from classId
                week: parseInt(week),
                subtopics
            })

            if (res.success) {
                toast.success("Lesson published to Digital Locker!")
                setTitle("")
                setContent("")
                setSubtopics("")
            } else {
                toast.error(res.error || "Failed to publish")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6 bg-slate-900 border-slate-800 text-slate-100">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                Publish to Digital Locker
            </h3>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Lesson Topic</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Introduction to Algebra"
                            className="bg-slate-950 border-slate-800"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Week</Label>
                        <Select value={week} onValueChange={setWeek}>
                            <SelectTrigger className="bg-slate-950 border-slate-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                                    <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Subtopics (comma separated)</Label>
                    <Input
                        value={subtopics}
                        onChange={(e) => setSubtopics(e.target.value)}
                        placeholder="Variables, Constants, Expressions"
                        className="bg-slate-950 border-slate-800"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Lesson Content</Label>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Enter detailed lesson notes here..."
                        className="min-h-[200px] bg-slate-950 border-slate-800 font-mono text-sm"
                    />
                </div>

                <Button
                    onClick={handlePublish}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                    {loading ? "Publishing..." : (
                        <>
                            <Save className="h-4 w-4 mr-2" /> Publish Lesson
                        </>
                    )}
                </Button>
            </div>
        </Card>
    )
}
