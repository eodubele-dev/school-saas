import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLessonPlans } from "@/lib/actions/teacher"

interface LessonPlan {
    id: string
    title: string
    subject: string
    content: string
    date: string
}

export default async function LessonPlansPage() {
    const lessons = await getLessonPlans() as LessonPlan[]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lesson Plans</h1>
                    <p className="text-muted-foreground">Manage and organize your teaching materials.</p>
                </div>
                <Link href="/lesson-plans/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Lesson
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {lessons.length > 0 ? (
                    lessons.map((lesson: LessonPlan) => (
                        <Card key={lesson.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                                <div className="text-sm text-muted-foreground">{lesson.subject}</div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {lesson.content || "No content preview."}
                                </p>
                                <div className="mt-4 text-xs text-muted-foreground font-medium">
                                    {new Date(lesson.date).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
                        <p>No lesson plans found.</p>
                        <Link href="/lesson-plans/new" className="mt-2 text-primary hover:underline">
                            Create your first lesson
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
