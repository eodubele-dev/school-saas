"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { startQuizAttempt, getQuizQuestions, finalizeQuiz, getQuizReview } from "@/lib/actions/student-learning"
import { ExamInterface } from "@/components/student/learning/exam-interface"
import { QuizResult } from "@/components/student/learning/quiz-result"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function CBTExamPage() {
    const params = useParams()
    const router = useRouter()
    const quizId = params?.quizId as string

    // State
    const [loading, setLoading] = useState(true)
    const [phase, setPhase] = useState<'start' | 'exam' | 'result'>('start')
    const [quizData, setQuizData] = useState<any>(null)
    const [questions, setQuestions] = useState<any[]>([])
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
    const [result, setResult] = useState<any>(null)
    const [attemptId, setAttemptId] = useState<string | null>(null)

    useEffect(() => {
        if (!quizId) return

        async function init() {
            setLoading(true)

            try {
                // 1. Start Attempt & Get Quiz Meta
                const attRes = await startQuizAttempt(quizId)

                if (attRes.success && attRes.attemptId && attRes.quiz) {
                    setAttemptId(attRes.attemptId)
                    setQuizData(attRes.quiz)

                    // CHECK IF COMPLETED (Review Mode)
                    if (attRes.status === 'completed') {
                        // Directly fetch reviewed questions
                        const reviewRes = await getQuizReview(attRes.attemptId)
                        if (reviewRes.success) {
                            setQuestions(reviewRes.questions || [])
                            setUserAnswers(reviewRes.userAnswers || {}) // Restore user's answers
                            setResult({
                                score: attRes.score,
                                // Calculate pct if not returned directly (backend returns score/total)
                                // But for now rely on quiz-result to calculate or pass dummy total
                                // Ideally getQuizReview returns score metadata too
                            })

                            // setQuestions(reviewRes.questions || []) // Already set above

                            // DO NOT call finalizeQuiz here - it would re-grade with empty answers and wipe the score!
                            setResult({
                                score: attRes.score,
                                // We might want to fetch the total points from the quiz metadata or calculate it
                                // For now, we trust the UI to handle it or fetch it separately if needed
                                percentage: attRes.score // Assuming score is percentage for now based on finalizeQuiz logic
                            })

                            setPhase('result')
                            setLoading(false)
                            return
                        }
                    }

                    // 2. Fetch Questions (Normal Mode)
                    const qRes = await getQuizQuestions(quizId)

                    if (qRes.success && qRes.questions.length > 0) {
                        setQuestions(qRes.questions)
                        setPhase('exam')
                    } else {
                        toast.error(qRes.questions.length === 0 ? "This quiz has no questions yet." : "Failed to load questions")
                        router.push('/dashboard/student/learning')
                    }
                } else {
                    toast.error(attRes.error || "Could not start quiz session")
                    router.push('/dashboard/student/learning')
                }
            } catch (err) {
                console.error(err)
                toast.error("An unexpected error occurred")
                router.push('/dashboard/student/learning')
            } finally {
                setLoading(false)
            }
        }

        init()
    }, [quizId, router])

    const handleComplete = async (answers: Record<string, string>) => {
        if (!attemptId) return

        setUserAnswers(answers)
        setLoading(true)

        const res = await finalizeQuiz(attemptId, answers)

        if (res.success) {
            // Fetch reviewed questions (with correct answers revealed)
            const reviewRes = await getQuizReview(attemptId)

            if (reviewRes.success) {
                setQuestions(reviewRes.questions || []) // Update questions with "Reviewed" version
            }

            setResult(res)
            setPhase('result')
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--school-accent)]" />
                    <p>Loading Exam Secure Context...</p>
                </div>
            </div>
        )
    }

    if (phase === 'result' && result) {
        return (
            <QuizResult
                score={result.score}
                totalPoints={result.totalPoints}
                percentage={result.percentage}
                questions={questions} // Pass questions for review text
                answers={userAnswers}
            />
        )
    }

    if (phase === 'exam' && quizData && questions.length > 0) {
        return (
            <ExamInterface
                quiz={quizData}
                questions={questions}
                onComplete={handleComplete}
            />
        )
    }

    return (
        <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--school-accent)]" />
                <p>Initializing Secure Exam Environment...</p>
            </div>
        </div>
    )
}
