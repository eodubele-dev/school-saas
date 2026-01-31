'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Create a new CBT Quiz
 */
export async function createQuiz(
    classId: string,
    subjectId: string,
    title: string,
    durationMinutes: number
) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        const { data, error } = await supabase
            .from('cbt_quizzes')
            .insert({
                tenant_id: profile?.tenant_id,
                class_id: classId,
                subject_id: subjectId,
                teacher_id: user.id,
                title,
                duration_minutes: durationMinutes,
                is_active: true
            })
            .select()
            .single()

        if (error) throw error

        return { success: true, quizId: data.id }
    } catch (error) {
        console.error('Error creating quiz:', error)
        return { success: false, error: 'Failed to create quiz' }
    }
}

/**
 * Add a question to a quiz
 */
export async function addQuestion(
    quizId: string,
    text: string,
    options: string[],
    correctIndex: number
) {
    const supabase = createClient()

    try {
        const { error } = await supabase
            .from('cbt_questions')
            .insert({
                quiz_id: quizId,
                question_text: text,
                options: options, // jsonb handles array
                correct_option: correctIndex
            })

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error adding question:', error)
        return { success: false, error: 'Failed to add question' }
    }
}

/**
 * Submit a quiz attempt (Auto-grading)
 */
export async function submitQuizAttempt(
    quizId: string,
    answers: Record<string, number> // questionId -> selectedIndex
) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        // Fetch student ID
        const { data: student } = await supabase
            .from('students')
            .select('id, tenant_id')
            .eq('parent_id', user.id) // Assuming parent/student link logic
            .single()

        // Fallback: Check if user is student directly (if implemented)
        const studentId = student?.id || user.id

        // Fetch questions and correct answers
        const { data: questions } = await supabase
            .from('cbt_questions')
            .select('id, correct_option, points')
            .eq('quiz_id', quizId)

        if (!questions) return { success: false, error: 'Quiz not found' }

        // Calculate score
        let score = 0
        let totalPossible = 0

        questions.forEach(q => {
            totalPossible += q.points
            if (answers[q.id] === q.correct_option) {
                score += q.points
            }
        })

        // Record attempt
        const { error } = await supabase
            .from('cbt_attempts')
            .insert({
                tenant_id: student?.tenant_id, // Or derive
                quiz_id: quizId,
                student_id: studentId,
                score,
                total_score: totalPossible,
                answers,
                completed_at: new Date().toISOString()
            })

        if (error) throw error

        return { success: true, score, total: totalPossible }

    } catch (error) {
        console.error('Error submitting quiz:', error)
        return { success: false, error: 'Failed to submit quiz' }
    }
}
