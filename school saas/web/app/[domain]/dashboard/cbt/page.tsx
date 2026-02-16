"use server"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, CheckCircle } from "lucide-react"
import { getPublishedQuizzesForStudent } from "@/lib/actions/cbt-student"

export default async function CBTPage() {
    const { success, data: quizzes, error } = await getPublishedQuizzesForStudent()

    if (!success) {
        return (
            <div className="p-10 text-center text-slate-400">
                <p>Failed to load assessments.</p>
                <p className="text-xs text-red-500/50 mt-2">{error}</p>
            </div>
        )
    }

    const quizList = quizzes || []

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">CBT Portal</h2>
                    <p className="text-slate-400">Computer Based Tests & Practice Quizzes</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quizList.length > 0 ? (
                    quizList.map((quiz: any) => (
                        <Card key={quiz.id} className="hover:shadow-md transition-shadow bg-slate-900 border-white/10 text-white">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">{quiz.subject_name}</Badge>
                                    <Badge variant="outline" className="gap-1 border-white/10 text-slate-400">
                                        <Clock className="h-3 w-3" /> {quiz.duration_minutes}m
                                    </Badge>
                                </div>
                                <CardTitle className="mt-2 text-xl">{quiz.title}</CardTitle>
                                <CardDescription className="text-slate-500">{quiz.total_questions} Questions • {quiz.total_marks} Marks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full gap-2 bg-[var(--school-accent)] hover:bg-[var(--school-accent)]/90 text-white font-bold">
                                    <PlayCircle className="h-4 w-4" />
                                    Start Quiz
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-slate-900/40 border-2 border-dashed border-white/5 rounded-2xl">
                        <CheckCircle className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No active assessments found.</p>
                        <p className="text-slate-600 text-sm mt-1">Check back later for new quizzes from your teachers.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
