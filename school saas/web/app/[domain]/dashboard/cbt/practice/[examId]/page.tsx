import { MockExam } from "@/components/cbt/mock-exam"
import { getPastQuestions } from "@/lib/actions/cbt-practice"



interface PageProps {
    params: {
        examId: string
    }
}

export default async function ExamPage({ params }: PageProps) {
    // Determine subject/exam from URL slug (Simple mapping for MVP demo)
    // e.g. /cbt/practice/math-waec -> Subject: Mathematics, Exam: WAEC

    let subject = "Mathematics"
    let examType = "WAEC"

    if (params.examId.includes("english")) subject = "English"
    if (params.examId.includes("jamb")) examType = "JAMB"

    const questions = await getPastQuestions(subject, examType)

    if (!questions || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <h2 className="text-2xl font-bold">No Questions Found</h2>
                <p className="text-muted-foreground">
                    We couldn&apos;t find any {subject} ({examType}) questions.
                </p>
                <p className="text-sm">Admin: Please upload a PDF in the Upload tab.</p>
            </div>
        )
    }

    return (
        <div className="flex-1 p-8 pt-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">{subject} - {examType} Mock Exam</h2>
                <p className="text-muted-foreground">
                    Answer all questions. Good luck!
                </p>
            </div>

            <MockExam questions={questions} durationMinutes={20} />
        </div>
    )
}
