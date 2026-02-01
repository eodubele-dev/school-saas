import { getEnrolledSubjects, getUpcomingQuizzes } from "@/lib/actions/student-learning"
import { SubjectFolders } from "@/components/student/learning/subject-folders"
import { QuizDashboard } from "@/components/student/learning/quiz-dashboard"

export default async function LearningHubPage() {
    const { subjects } = await getEnrolledSubjects()
    const { quizzes } = await getUpcomingQuizzes()

    return (
        <div className="p-6 md:p-8 space-y-12 max-w-7xl mx-auto min-h-screen bg-slate-950">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Learning Hub</h1>
                <p className="text-slate-400">Access your digital locker and CBT testing center.</p>
            </div>

            <SubjectFolders subjects={subjects || []} />

            <div className="h-px bg-white/5" />

            <QuizDashboard quizzes={quizzes || []} />
        </div>
    )
}
