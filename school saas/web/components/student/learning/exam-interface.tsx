"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, Clock, MonitorOff } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ExamInterface({ quiz, questions, onComplete }: { quiz: any, questions: any[], onComplete: (answers: Record<string, string>) => void }) {
    const [currentIdx, setCurrentIdx] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [timeLeft, setTimeLeft] = useState(quiz.duration_minutes * 60)
    const [confirmSubmit, setConfirmSubmit] = useState(false)

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit() // Auto submit
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }

    const handleSelectOption = (optionKey: string) => {
        const qId = questions[currentIdx].id
        setAnswers(prev => ({ ...prev, [qId]: optionKey }))
    }

    const handleSubmit = () => {
        onComplete(answers)
    }

    const currentQ = questions[currentIdx]
    const isAnswered = !!answers[currentQ.id]

    return (
        <div className="h-screen w-full bg-slate-950 flex flex-col overflow-hidden">
            {/* Header: Distraction Free */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900">
                <div className="flex items-center gap-4">
                    <MonitorOff className="h-5 w-5 text-slate-500" />
                    <div>
                        <h1 className="text-white font-bold text-sm md:text-base line-clamp-1">{quiz.title}</h1>
                        <p className="text-xs text-slate-400">Question {currentIdx + 1} of {questions.length}</p>
                    </div>
                </div>

                <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg transition-colors border",
                    timeLeft < 60 ? "bg-red-900/20 text-red-500 border-red-500/50 animate-pulse" : "bg-slate-800 text-[var(--school-accent)] border-[var(--school-accent)]/20"
                )}>
                    <Clock className="h-4 w-4" />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Side: Navigator (Hidden on mobile usually or drawer) */}
                <div className="hidden md:flex w-64 border-r border-white/5 bg-slate-900/50 flex-col p-4 overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Navigator</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIdx(i)}
                                className={cn(
                                    "h-10 w-10 rounded flex items-center justify-center text-xs font-bold transition-all",
                                    currentIdx === i ? "ring-2 ring-white bg-slate-800 text-white" : "",
                                    answers[q.id]
                                        ? "bg-[var(--school-accent)] text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                        : "bg-slate-900 border border-white/10 text-slate-500 hover:text-white"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 p-6 md:p-12 overflow-y-auto flex flex-col items-center">
                    <div className="max-w-3xl w-full space-y-8">

                        {/* Question Text */}
                        <div className="prose prose-invert prose-lg max-w-none">
                            <p className="text-white font-medium text-xl leading-relaxed">
                                {currentQ.question_text}
                            </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 mt-8">
                            {['option_a', 'option_b', 'option_c', 'option_d'].map((optKey) => (
                                currentQ[optKey] && (
                                    <button
                                        key={optKey}
                                        onClick={() => handleSelectOption(optKey)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all group relative overflow-hidden",
                                            answers[currentQ.id] === optKey
                                                ? "bg-[var(--school-accent)]/10 border-[var(--school-accent)] text-white"
                                                : "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800 hover:border-white/20"
                                        )}
                                    >
                                        <span className="relative z-10 flex gap-4">
                                            <span className="font-bold uppercase text-xs opacity-50 w-6">
                                                {optKey.split('_')[1]}
                                            </span>
                                            {currentQ[optKey]}
                                        </span>
                                        {answers[currentQ.id] === optKey && (
                                            <CheckCircle2 className="h-5 w-5 text-[var(--school-accent)] relative z-10" />
                                        )}
                                    </button>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Nav */}
            <div className="h-20 border-t border-white/10 bg-slate-900 px-6 flex items-center justify-between">
                <Button
                    variant="ghost"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className="text-slate-400 hover:text-white"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Prev
                </Button>

                {currentIdx < questions.length - 1 ? (
                    <Button
                        onClick={() => setCurrentIdx(prev => prev + 1)}
                        className="bg-white text-slate-900 hover:bg-slate-200"
                    >
                        Next <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={() => setConfirmSubmit(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                    >
                        Submit Exam
                    </Button>
                )}
            </div>

            {/* Confirmation Modal (Simple overlay) */}
            {confirmSubmit && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full p-8 bg-slate-900 border-white/10 text-center">
                        <div className="h-16 w-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="h-8 w-8 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Are you sure?</h2>
                        <p className="text-slate-400 mb-8">
                            You have answered {Object.keys(answers).length} of {questions.length} questions.
                            Once submitted, you cannot change your answers.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" onClick={() => setConfirmSubmit(false)} className="border-white/10 text-white">
                                Go Back
                            </Button>
                            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                                Confirm Submit
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
