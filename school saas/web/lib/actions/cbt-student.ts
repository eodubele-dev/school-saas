'use server'

import { createClient } from '@/lib/supabase/server'

export interface StudentQuiz {
    id: string
    title: string
    subject_name: string
    duration_minutes: number
    total_questions: number
    total_marks: number
    created_at: string
}

export async function getPublishedQuizzesForStudent() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    // 1. Get Student's Class (Using robust fallback logic from student-dashboard.ts)
    // Try by user_id first
    let { data: student } = await supabase.from('students').select('id, class_id').eq('user_id', user.id).maybeSingle()

    // Fallback: Try by email
    if (!student) {
        // If not directly linked, try matching email from profile
        const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single()
        if (profile?.email) {
            const { data: s } = await supabase.from('students').select('id, class_id').eq('email', profile.email).maybeSingle()
            if (s) student = s
        }
    }

    // Fallback: If still nothing, and maybe in a demo environment or just broken link
    // We return error or empty. 
    if (!student || !student.class_id) {
        return { success: false, error: "Could not find student enrollment record." }
    }

    // 2. Fetch Quizzes for that Class
    const { data: quizzes, error: quizError } = await supabase
        .from('cbt_quizzes')
        .select(`
            id,
            title,
            duration_minutes,
            total_marks,
            created_at,
            subject:subjects(name),
            questions:cbt_questions(count)
        `)
        .eq('class_id', student.class_id)
        .eq('is_active', true) // Only Published
        .order('created_at', { ascending: false })

    if (quizError) {
        console.error("Error fetching student quizzes:", quizError)
        return { success: false, error: "Failed to load quizzes" }
    }

    const formatted = quizzes.map(q => ({
        id: q.id,
        title: q.title,
        duration_minutes: q.duration_minutes,
        total_marks: q.total_marks,
        created_at: q.created_at,
        total_questions: q.questions?.[0]?.count || 0,
        // @ts-ignore
        subject_name: q.subject?.name || 'General'
    }))

    return { success: true, data: formatted }
}
