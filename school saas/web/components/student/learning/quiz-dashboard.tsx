"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
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
                    quizzes.map(quiz => (
                        <Card key={quiz.id} className="p-4 bg-slate-900 border-white/5 flex items-center justify-between group hover:border-purple-500/50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-lg">
                                    {quiz.subject?.substring(0, 2)}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold">{quiz.title}</h4>
                                    <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {quiz.duration_minutes}m</span>
                                        <span>•</span>
                                        <span>{quiz.date ? formatDate(quiz.date) : 'Available Now'}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => router.push(`/dashboard/student/cbt/${quiz.id}`)}
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-purple-500"
                            >
                                Start Quiz <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Card>
                    ))
                )}
            </div>

            {/* Completed Mock */}
            <div className="mt-8 pt-8 border-t border-white/5">
                <h4 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4">Recent Results</h4>
                <div className="p-3 rounded bg-slate-950 border border-white/5 flex justify-between items-center opacity-75">
                    <div className="flex gap-3 items-center">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-slate-300">Math - Week 4 Assessment</span>
                    </div>
                    <span className="text-sm font-bold text-white">85%</span>
                </div>
            </div>
        </div>
    )
}
