"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Home, RotateCcw, Brain } from "lucide-react"
import { useRouter } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

export function QuizResult({ score, totalPoints, percentage, questions, answers }: any) {
    const router = useRouter()

    // Mock feedback based on score
    const getFeedback = (pct: number) => {
        if (pct >= 90) return { text: "Outstanding!", color: "text-purple-400" }
        if (pct >= 70) return { text: "Great Job!", color: "text-green-400" }
        if (pct >= 50) return { text: "Good Effort", color: "text-yellow-400" }
        return { text: "Needs Improvement", color: "text-red-400" }
    }

    const feedback = getFeedback(percentage)

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
            <Card className="max-w-2xl w-full bg-slate-900 border-white/5 overflow-hidden">
                <div className="p-12 text-center border-b border-white/5 bg-gradient-to-b from-slate-900 to-slate-900/50">
                    <div className="mb-4 inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400">
                        Quiz Completed
                    </div>
                    <div className={`text-6xl font-black mb-2 ${feedback.color}`}>
                        {Math.round(percentage)}%
                    </div>
                    <p className="text-xl font-medium text-white mb-2">{feedback.text}</p>
                    <p className="text-slate-400">You scored {score} out of {totalPoints} points</p>
                </div>

                <div className="p-8 space-y-6">
                    <h3 className="text-white font-bold border-b border-white/5 pb-2">Review Answers</h3>

                    <Accordion type="single" collapsible className="w-full">
                        {questions.map((q: any, i: number) => {
                            // Logic to determine if user was correct (mocked if answer data missing in passed prop, normally passed)
                            // We assume answers prop has the state
                            const userAns = answers[q.id]
                            const isCorrect = userAns === q.correct_answer // Assuming correct_answer is available for review

                            return (
                                <AccordionItem key={q.id} value={q.id} className="border-white/5">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex gap-4 text-left w-full">
                                            <div className="mt-1">
                                                {isCorrect ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{q.question_text}</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-9 pb-4 space-y-3">
                                        {/* User Selection */}
                                        <div className={cn(
                                            "p-3 rounded border text-sm",
                                            isCorrect
                                                ? "bg-green-500/10 border-green-500/20 text-green-200"
                                                : "bg-red-500/10 border-red-500/20 text-red-200"
                                        )}>
                                            <span className="block text-xs opacity-70 uppercase tracking-wider mb-1">Your Selection</span>
                                            <div className="font-bold">
                                                {userAns ? (q[userAns] || "Option " + userAns) : "No Selection"}
                                            </div>
                                        </div>

                                        {/* Correct Answer */}
                                        {!isCorrect && (
                                            <div className="p-3 bg-slate-950 rounded border border-white/5 text-sm">
                                                <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Correct Answer</span>
                                                <div className="text-green-400 font-bold">{q[q.correct_answer] || "Option " + q.correct_answer}</div>
                                            </div>
                                        )}

                                        {q.explanation && (
                                            <div className="flex gap-3 items-start p-3 bg-purple-500/10 rounded border border-purple-500/20">
                                                <Brain className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                                                <div className="text-sm text-purple-200">
                                                    <span className="block font-bold mb-1 text-xs uppercase">AI Explanation</span>
                                                    {q.explanation}
                                                </div>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>

                    <div className="flex gap-4 pt-4">
                        <Button
                            onClick={() => router.push('/dashboard/student/learning')}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
                        >
                            <Home className="h-4 w-4 mr-2" /> Return to Hub
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
