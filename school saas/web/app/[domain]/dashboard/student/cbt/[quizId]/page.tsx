"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { startQuizAttempt, getQuizQuestions, finalizeQuiz } from "@/lib/actions/student-learning"
import { ExamInterface } from "@/components/student/learning/exam-interface"
import { QuizResult } from "@/components/student/learning/quiz-result"
import { Loader2 } from "lucide-react"

export default function CBTExamPage() {
    const params = useParams()
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

            // 1. Start Attempt (server checks if exists)
            const attRes = await startQuizAttempt(quizId)

            if (attRes.success && attRes.attemptId) {
                setAttemptId(attRes.attemptId)

                // 2. Fetch Questions (server action should also return quiz meta or we do separate)
                // Assuming we need quiz meta for title/duration. 
                // Currently API separation is a bit loose in demo actions.
                // Let's assume getQuizQuestions returns questions. 
                // We might need another call for Quiz Meta if not already stored.
                // For demo speed, let's fetch questions and assume we have quiz meta passed or fetchable.

                const qRes = await getQuizQuestions(quizId)

                if (qRes.success) {
                    setQuestions(qRes.questions)
                    // Mock Quiz Meta if not fetched (real app would fetch 'cbt_quizzes' row)
                    setQuizData({
                        id: quizId,
                        title: "Mid-Term Assessment", // Placeholder until fetched
                        duration_minutes: 30
                    })
                    setPhase('exam')
                } else {
                    alert("Failed to load questions")
                }
            } else {
                alert("Could not start quiz session")
            }
            setLoading(false)
        }

        init()
    }, [quizId])

    const handleComplete = async (answers: Record<string, string>) => {
        if (!attemptId) return

        setUserAnswers(answers)
        setLoading(true)

        const res = await finalizeQuiz(attemptId, answers)

        if (res.success) {
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

    return (
        <ExamInterface
            quiz={quizData}
            questions={questions}
            onComplete={handleComplete}
        />
    )
}
