'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get unique subjects available in past questions
 */
export async function getPastQuestionSubjects() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'Profile not found' }

    const { data, error } = await supabase
        .from('past_questions')
        .select('subject')
        .eq('tenant_id', profile.tenant_id)

    if (error) return { success: false, error: error.message }

    const subjects = Array.from(new Set(data.map(q => q.subject)))
    return { success: true, data: subjects }
}

/**
 * Get available exam types and years for a subject
 */
export async function getPastQuestionMetadata(subject: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'Profile not found' }

    const { data, error } = await supabase
        .from('past_questions')
        .select('exam_type, year')
        .eq('tenant_id', profile.tenant_id)
        .eq('subject', subject)

    if (error) return { success: false, error: error.message }

    // Group and count
    const metadataMap = new Map<string, { examTypes: Set<string>, years: Set<number>, counts: Record<string, number> }>()
    
    const examTypes = Array.from(new Set(data.map(q => q.exam_type)))
    const years = Array.from(new Set(data.map(q => q.year))).sort((a, b) => b - a)

    // Calculate counts per combination
    const counts: Record<string, number> = {}
    data.forEach(q => {
        const key = `${q.exam_type}_${q.year}`
        counts[key] = (counts[key] || 0) + 1
    })

    return { success: true, data: { examTypes, years, counts } }
}

/**
 * Start a practice session
 */
export async function startPracticeSession(data: { subject: string, examType: string, year: number }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'Profile not found' }

    // 1. Fetch Questions
    const { data: questions, error: qError } = await supabase
        .from('past_questions')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('subject', data.subject)
        .eq('exam_type', data.examType)
        .eq('year', data.year)

    if (qError) return { success: false, error: qError.message }
    if (!questions || questions.length === 0) return { success: false, error: 'No questions found for this selection' }

    // 2. Create Practice Session Record
    const { data: session, error: sError } = await supabase
        .from('practice_sessions')
        .insert({
            tenant_id: profile.tenant_id,
            student_id: user.id,
            subject: data.subject,
            exam_type: data.examType,
            year: data.year,
            total_questions: questions.length,
            status: 'in_progress'
        })
        .select()
        .single()

    if (sError) {
        console.error("Practice session creation error:", sError)
        // If the table doesn't exist yet, we still return the questions so the student can practice!
        // We just won't be able to save progress.
        return { success: true, data: { questions, sessionId: null } }
    }

    return { success: true, data: { questions, sessionId: session.id } }
}

/**
 * Submit practice session results
 */
export async function submitPracticeResults(sessionId: string, score: number, answers: any[]) {
    const supabase = createClient()
    const { error } = await supabase
        .from('practice_sessions')
        .update({
            score,
            answers,
            status: 'completed'
        })
        .eq('id', sessionId)

    if (error) return { success: false, error: error.message }
    
    revalidatePath('/dashboard/student/cbt/practice')
    return { success: true }
}

/**
 * Get recent practice sessions for the student
 */
export async function getRecentPracticeSessions(limit: number = 5) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

/**
 * Get student's practice progress for today
 */
export async function getDailyPracticeProgress() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
        .from('practice_sessions')
        .select('score, total_questions')
        .eq('student_id', user.id)
        .gte('created_at', today.toISOString())

    if (error) return { success: false, error: error.message }

    const totalQuestions = data.reduce((acc, curr) => acc + (curr.total_questions || 0), 0)
    const totalCorrect = data.reduce((acc, curr) => acc + (curr.score || 0), 0)
    const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

    return { 
        success: true, 
        data: { 
            percentage, 
            totalQuestions, 
            sessionCount: data.length 
        } 
    }
}

/**
 * Get AI Explanation for a question
 */
export async function getAIExplanation(questionText: string, options: string[], correctAnswer: string) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) return { success: false, error: 'AI Explanations not configured' }

    try {
        const prompt = `
            You are a brilliant academic tutor. Explain why the correct answer to this question is "${correctAnswer}".
            
            Question: ${questionText}
            Options: ${options.join(', ')}
            
            Provide a clear, step-by-step breakdown that a student can easily understand. 
            Keep it concise but educational.
        `

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        })

        const result = await response.json()
        const explanation = result.candidates?.[0]?.content?.parts?.[0]?.text || "No explanation available."

        return { success: true, data: explanation }
    } catch (error) {
        return { success: false, error: 'Failed to generate AI explanation' }
    }
}
