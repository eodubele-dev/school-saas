"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { PastQuestion } from "@/lib/actions/cbt-practice"

interface MockExamProps {
    questions: PastQuestion[]
    durationMinutes: number
}

export function MockExam({ questions, durationMinutes }: MockExamProps) {
    // State
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({}) // qId -> selectedOptionIndex
    const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Timer Ref
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isSubmitted) return

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isSubmitted])

    const handleSelect = (index: number) => {
        if (isSubmitted) return
        const qId = questions[currentIndex].id
        setAnswers(prev => ({ ...prev, [qId]: index }))
    }

    const handleSubmit = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        setIsSubmitted(true)
        toast.success("Exam Submitted!")
        // Scroll to top
        window.scrollTo(0, 0)
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    // REVIEW MODE
    if (isSubmitted) {
        let score = 0
        questions.forEach(q => {
            if (answers[q.id] === q.correct_option) score++
        })
        const percentage = Math.round((score / questions.length) * 100)

        return (
            <div className="space-y-8 max-w-3xl mx-auto">
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Result: {score} / {questions.length}</CardTitle>
                        <div className="text-muted-foreground font-medium text-lg">{percentage}%</div>
                    </CardHeader>
                </Card>

                {questions.map((q, idx) => {
                    const selected = answers[q.id]
                    const isCorrect = selected === q.correct_option

                    return (
                        <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <CardHeader>
                                <CardTitle className="text-lg flex gap-3">
                                    <span className="text-muted-foreground">#{idx + 1}</span>
                                    {isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                                    {q.question_text}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-2">
                                    {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className={`p-3 rounded-md border text-sm flex items-center justify-between
                                            ${optIdx === q.correct_option ? 'bg-green-100 border-green-200' : ''}
                                            ${optIdx === selected && optIdx !== q.correct_option ? 'bg-red-100 border-red-200' : ''}
                                        `}>
                                            <span>{['A', 'B', 'C', 'D'][optIdx]}. {opt}</span>
                                            {optIdx === q.correct_option && <CheckCircle className="h-4 w-4 text-green-600" />}
                                            {optIdx === selected && optIdx !== q.correct_option && <XCircle className="h-4 w-4 text-red-600" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 flex gap-2 items-start">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <div>
                                        <span className="font-bold">Explanation:</span> {q.explanation}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
                <Button onClick={() => window.location.reload()} size="lg" className="w-full">Take Another Test</Button>
            </div>
        )
    }

    // EXAM MODE
    const currentQ = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header: Timer & Progress */}
            <div className="flex items-center justify-between sticky top-4 bg-background z-10 p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-2 text-xl font-mono font-bold text-primary">
                    <Clock className="h-5 w-5" />
                    {formatTime(timeLeft)}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                </div>
            </div>

            <Progress value={progress} className="h-2" />

            <Card className="min-h-[400px] flex flex-col justify-between">
                <CardContent className="pt-6 space-y-6">
                    <h3 className="text-xl font-semibold leading-relaxed">
                        {currentQ.question_text}
                    </h3>

                    <div className="space-y-3">
                        {currentQ.options.map((option, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors
                                    ${answers[currentQ.id] === idx
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                        : 'hover:bg-muted/50'
                                    }
                                `}
                            >
                                <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium
                                    ${answers[currentQ.id] === idx ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground'}
                                `}>
                                    {['A', 'B', 'C', 'D'][idx]}
                                </div>
                                <span className={answers[currentQ.id] === idx ? 'font-medium' : ''}>{option}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t p-6">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>

                    {currentIndex === questions.length - 1 ? (
                        <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                            Submit Exam <CheckCircle className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}>
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <div className="grid grid-cols-10 gap-2">
                {questions.map((q, idx) => (
                    <div
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 rounded-full cursor-pointer transition-colors
                            ${idx === currentIndex ? 'bg-primary scale-125' :
                                answers[q.id] !== undefined ? 'bg-blue-400' : 'bg-slate-200'}
                        `}
                    />
                ))}
            </div>
        </div>
    )
}
