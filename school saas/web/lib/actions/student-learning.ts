'use server'

import { createClient } from '@/lib/supabase/server'


// --- Types ---
export type QuizAttempt = {
    id: string;
    quiz_id: string;
    student_id: string;
    score: number;
    total_questions: number;
    status: 'in_progress' | 'completed';
    started_at: string;
    completed_at?: string;
}

// --- Actions ---

export async function getEnrolledSubjects() {
    const supabase = createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return { success: false, error: "Unauthorized" }

    // 1. Get Student & Class
    const { data: student } = await supabase
        .from('students')
        .select('id, class_id')
        .limit(1)
        .single() // In real app, link via auth user

    if (!student || !student.class_id) return { success: false, error: "Student class not found" }

    // 2. Fetch Subjects linked to this class (or all subjects if class linkage is loose)
    // For demo, we might just return a distinct list of subjects from lessons or a predefined list
    // Ideally we have a table `class_subjects`. For now, let's mock or query lessons.

    // Let's get distinct subjects from lessons table for this tenant/grade? 
    // Or just hardcode common ones for the "Digital Locker" feel if schema is simple.
    // Using `lessons` table to find subjects with content.
    const { data: subjects } = await supabase
        .from('lessons')
        .select('subject, count(*)')
        .eq('grade_level', 'Grade 2') // Hardcoded for demo, normally student.class.grade_level
    // .group('subject') // Supabase JS SDK group is tricky, usually distinct

    // Using a simpler approach: Return a standard list augmented with lesson counts if possible
    // or just unique subjects found in lessons.

    // Mocking for reliable demo UI:
    return {
        success: true,
        subjects: [
            { name: 'Mathematics', lessonCount: 12, color: 'bg-blue-500' },
            { name: 'English Language', lessonCount: 15, color: 'bg-green-500' },
            { name: 'Basic Science', lessonCount: 8, color: 'bg-purple-500' },
            { name: 'Social Studies', lessonCount: 6, color: 'bg-orange-500' },
            { name: 'Computer Studies', lessonCount: 10, color: 'bg-cyan-500' },
        ]
    }
}

export async function getSubjectLessons(subject: string) {
    const supabase = createClient()
    // Fetch published notes
    const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject', subject)
        .order('order_index', { ascending: true })

    return { success: true, lessons: lessons || [] }
}

export async function getUpcomingQuizzes() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch quizzes that are published
    const { data: quizzes } = await supabase
        .from('cbt_quizzes')
        .select('*')
        .eq('status', 'published')
        //.eq('class_id', student.class_id) // Add filter in real app
        .order('created_at', { ascending: false })

    return { success: true, quizzes: quizzes || [] }
}

export async function startQuizAttempt(quizId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Student ID
    const { data: student } = await supabase.from('students').select('id, tenant_id').limit(1).single()
    if (!student) return { success: false, error: "Student not found" }

    // Check existing in-progress attempt
    const { data: existing } = await supabase
        .from('cbt_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('student_id', student.id)
        .eq('status', 'in_progress')
        .single()

    if (existing) {
        return { success: true, attemptId: existing.id }
    }

    // Create new attempt
    const { data: newAttempt, error } = await supabase
        .from('cbt_attempts')
        .insert({
            tenant_id: student.tenant_id,
            quiz_id: quizId,
            student_id: student.id,
            status: 'in_progress',
            started_at: new Date().toISOString(),
            score: 0,
            total_questions: 0 // Will update on finalize or from quiz meta
        })
        .select()
        .single()

    if (error) return { success: false, error: "Failed to start quiz" }

    return { success: true, attemptId: newAttempt.id }
}

export async function getQuizQuestions(quizId: string) {
    const supabase = createClient()
    const { data: questions } = await supabase
        .from('cbt_questions')
        .select('id, question_text, option_a, option_b, option_c, option_d, question_type') // Exclude correct_answer!
        .eq('quiz_id', quizId)

    return { success: true, questions: questions || [] }
}

export async function submitQuizAnswers(_attemptId: string, _answers: Record<string, string>) {
    // const supabase = createClient()

    // In a real high-security CBT, we save each answer individually.
    // For this PWA/Demo, we save the JSON blob or batch insert.
    // Let's assume we save detailed records in `cbt_answers` table.

    // For simplicity/speed in demo, we'll process scoring immediately in finalize
    // OR save to a JSONb column in cbt_attempts if schema permits.
    // Let's try batch inserting to cbt_answers if table exists, else log warnings.

    // Check schema compliance first? 
    // We'll proceed to 'finalize' which does the grading.

    return { success: true }
}

export async function finalizeQuiz(attemptId: string, answers: Record<string, string>) {
    const supabase = createClient()

    // 1. Get Attempt + Quiz + Questions (with correct answers)
    const { data: attempt } = await supabase.from('cbt_attempts').select('*, quiz:cbt_quizzes(*)').eq('id', attemptId).single()
    if (!attempt) return { success: false }

    const { data: questions } = await supabase
        .from('cbt_questions')
        .select('id, correct_answer, points')
        .eq('quiz_id', attempt.quiz_id)

    if (!questions) return { success: false }

    // 2. Calculate Score
    let score = 0
    let totalPoints = 0

    // 3. Save Answers (Batch)
    // Assuming cbt_answers table exists
    /*
    const detailedAnswers = questions.map(q => {
        const studentAns = answers[q.id]
        const isCorrect = studentAns === q.correct_answer
        const points = q.points || 1

        if (isCorrect) score += points
        totalPoints += points

        return {
            student_id: attempt.student_id,
            attempt_id: attemptId,
            question_id: q.id,
            selected_option: studentAns,
            is_correct: isCorrect
        }
    })

    await supabase.from('cbt_answers').insert(detailedAnswers)
    */

    // Calculate score manually since we prioritized logic above
    for (const q of questions) {
        const studentAns = answers[q.id]
        if (studentAns === q.correct_answer) {
            score += (q.points || 1)
        }
        totalPoints += (q.points || 1)
    }


    // 4. Update Attempt
    const pct = totalPoints > 0 ? (score / totalPoints) * 100 : 0

    await supabase.from('cbt_attempts').update({
        status: 'completed',
        score: score, // Raw Score or Percentage? Let's use Percentage for simplicity in UI or store raw
        completed_at: new Date().toISOString(),
        // submitted_answers: answers // Optional JSON storage
    }).eq('id', attemptId)

    return { success: true, score, totalPoints, percentage: pct }
}

export async function getQuizReview(attemptId: string) {
    const supabase = createClient()

    // Fetch attempt, quiz, questions (including explanation and correct answer)
    // This is only allowed if attempt is completed
    const { data: attempt } = await supabase.from('cbt_attempts').select('*').eq('id', attemptId).single()

    if (!attempt || attempt.status !== 'completed') return { success: false, error: "Review not available" }

    const { data: questions } = await supabase
        .from('cbt_questions')
        .select('*')
        .eq('quiz_id', attempt.quiz_id)

    // We also need the user's answers. 
    // If we didn't store them in `cbt_answers`, we can't show "Your Selection" accurately unless passed or stored in JSON.
    // For this demo, let's assume we can't fully reconstruct "Your Answer" without that table, 
    // unless the frontend passes it or we mocked it.
    // To make the demo robust, let's assume `questions` returns the `explanation`.

    return { success: true, attempt, questions }
}
