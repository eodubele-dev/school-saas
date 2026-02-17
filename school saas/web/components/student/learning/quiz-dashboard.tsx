"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, cn } from "@/lib/utils"
import { BrainCircuit, Clock, ChevronRight, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuizDashboard({ quizzes }: { quizzes: any[] }) {
    const router = useRouter()

    return (
        <div className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-purple-400" />
                CBT Testing Center
            </h3>

            <div className="space-y-3">
                {quizzes.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900 border border-white/5 rounded-lg text-slate-500 text-sm">
                        No active quizzes at the moment.
                    </div>
                ) : (
                    quizzes.map(quiz => {
                        const isCompleted = quiz.attempt_status === 'completed'
                        const isInProgress = quiz.attempt_status === 'in_progress'

                        // If completed, score is now stored as percentage (0-100).
                        // If legacy data (raw score), we might show a low number, but new attempts will be correct.
                        // We can detect if score <= 1 (likely percentage decimal?) or <= total_questions (likely raw).
                        // But let's assume valid percentage for now as per new logic.
                        const scorePct = isCompleted
                            ? Math.round(quiz.score)
                            : (quiz.total_questions > 0 ? Math.round((quiz.score / quiz.total_questions) * 100) : 0)

                        return (
                            <Card key={quiz.id} className="p-4 bg-slate-900 border-white/5 flex items-center justify-between group hover:border-purple-500/50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-lg flex items-center justify-center font-bold text-lg",
                                        isCompleted ? "bg-green-500/10 text-green-500" : "bg-purple-500/10 text-purple-400"
                                    )}>
                                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : quiz.subject?.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                            {quiz.title}
                                            {isCompleted && (
                                                <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                                                    {scorePct}% Score
                                                </span>
                                            )}
                                            {isInProgress && (
                                                <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                                                    In Progress
                                                </span>
                                            )}
                                        </h4>
                                        <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {quiz.duration_minutes}m</span>
                                            <span>•</span>
                                            <span>{quiz.date ? formatDate(quiz.date) : 'Available Now'}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => router.push(`/dashboard/student/cbt/${quiz.id}`)}
                                    variant={isCompleted ? "outline" : "default"}
                                    className={cn(
                                        "border border-white/10 transition-all",
                                        isCompleted
                                            ? "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
                                            : "bg-white/5 hover:bg-white/10 text-white hover:border-purple-500"
                                    )}
                                >
                                    {isCompleted ? "Review Results" : (isInProgress ? "Resume Quiz" : "Start Quiz")}
                                    {isCompleted ? <BrainCircuit className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                                </Button>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
