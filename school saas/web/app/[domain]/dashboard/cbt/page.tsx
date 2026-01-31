"use client"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, Clock, CheckCircle } from "lucide-react"

// Mock data for MVP - in real app, fetch from `cbt_quizzes` table
const DEMO_QUIZZES = [
    { id: '1', title: 'Mathematics - Algebra Checkpoint', subject: 'Mathematics', duration: 45, questions: 20 },
    { id: '2', title: 'English Language - Comprehension', subject: 'English', duration: 60, questions: 30 },
]

export default function CBTPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">CBT Portal</h2>
                    <p className="text-muted-foreground">Computer Based Tests & Practice Quizzes</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {DEMO_QUIZZES.map(quiz => (
                    <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="secondary">{quiz.subject}</Badge>
                                <Badge variant="outline" className="gap-1">
                                    <Clock className="h-3 w-3" /> {quiz.duration}m
                                </Badge>
                            </div>
                            <CardTitle className="mt-2 text-xl">{quiz.title}</CardTitle>
                            <CardDescription>{quiz.questions} Questions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full gap-2">
                                <PlayCircle className="h-4 w-4" />
                                Start Quiz
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {/* Coming Soon Card */}
                <Card className="border-dashed bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-muted-foreground">More Quizzes Coming Soon</CardTitle>
                        <CardDescription>Teachers are uploading new tests.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                        <CheckCircle className="h-12 w-12 text-muted-foreground/20" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
