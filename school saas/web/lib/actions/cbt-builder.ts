'use server'

import { createClient } from '@/lib/supabase/server'
import { model } from '@/lib/gemini'


export interface BankQuestion {
    id: string
    question_text: string
    options: string[]
    correct_option: number
    explanation: string
    points?: number
}

export interface QuizData {
    id?: string
    title: string
    subject_id?: string
    class_id?: string
    duration: number
    total_marks: number
    shuffle_mode: boolean
    visibility: 'draft' | 'published'
    scheduled_at?: string
}

/**
 * Fetch a quiz by ID or the latest draft for a class/subject
 */
export async function getQuiz(classId: string, subjectId: string, quizId?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, data: null }

    let query = supabase
        .from('cbt_quizzes')
        .select(`
            *,
            questions:cbt_questions(*)
        `)

    if (quizId) {
        query = query.eq('id', quizId)
    } else {
        query = query
            .eq('class_id', classId)
            .eq('subject_id', subjectId)
            .eq('teacher_id', user.id)
            .eq('is_active', false)
            .order('created_at', { ascending: false })
            .limit(1)
    }

    const { data: quiz, error } = await query.maybeSingle()

    if (error) {
        console.error('Error fetching quiz:', error)
        return { success: false, data: null }
    }

    return { success: true, data: quiz }
}

/**
 * Search the external exam bank (JAMB/WAEC/etc)
 */
export async function searchExamBank(filters: {
    subject: string
    examType: string
    year?: string
    topic?: string
}) {
    const supabase = createClient()

    let query = supabase
        .from('past_questions')
        .select('*')
        .eq('subject', filters.subject)
        .eq('exam_type', filters.examType)

    if (filters.year) {
        query = query.eq('year', parseInt(filters.year))
    }

    const { data, error } = await query.limit(50)

    if (error) {
        console.error('Error searching bank:', error)
        return []
    }

    return data as BankQuestion[]
}

/**
 * Generate questions using Gemini 1.5 Flash
 */
export async function generateAIQuestions(params: {
    subject: string
    topic: string
    count: number
    difficulty: string
}) {
    const prompt = `
        Act as an expert Nigerian curriculum assessment specialist.
        Generate ${params.count} multiple-choice questions for the subject "${params.subject}" on the topic "${params.topic}".
        Difficulty Level: ${params.difficulty}

        Requirements:
        1. Each question must have exactly 4 options (A, B, C, D).
        2. Provide a clear "explanation" for the correct answer.
        3. Format the output as a strict JSON array.

        Output Schema:
        [
          {
            "question_text": "string",
            "options": ["string", "string", "string", "string"],
            "correct_option": number (0-3),
            "explanation": "string"
          }
        ]
        
        Return ONLY the JSON.
    `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const rawText = response.text()

        // Robust JSON extraction
        const jsonMatch = rawText.match(/\[[\s\S]*\]/)
        if (!jsonMatch) {
            console.error('AI Response did not contain a JSON array:', rawText)
            return []
        }

        const cleanJson = jsonMatch[0]
        return JSON.parse(cleanJson)
    } catch (error) {
        console.error('AI Generation Error:', error)
        return []
    }
}

/**
 * Get a step-by-step breakdown (Simplify/Explain)
 */
export async function getAIExplanation(question: string, answer: string) {
    const prompt = `
        Act as a helpful tutor. Provide a step-by-step, simple breakdown explaining why the answer "${answer}" is correct for the following question:
        
        Question: ${question}
        
        Tone: Encouraging and easy to understand for a student. Keep it under 100 words.
    `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text().trim()
    } catch (error) {
        console.error('AI Explanation Error:', error)
        return "Could not generate explanation at this time."
    }
}

/**
 * Save the entire assessment (Quiz + Questions)
 */
export async function syncAssessment(quizData: QuizData, questions: BankQuestion[]) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) throw new Error('Profile not found')

        // 1. Upsert Quiz
        const { data: quiz, error: quizError } = await supabase
            .from('cbt_quizzes')
            .upsert({
                id: quizData.id, // If present, it updates
                tenant_id: profile.tenant_id,
                teacher_id: user.id,
                title: quizData.title,
                subject_id: quizData.subject_id,
                class_id: quizData.class_id,
                duration_minutes: quizData.duration,
                total_marks: quizData.total_marks,
                shuffle_mode: quizData.shuffle_mode,
                visibility: quizData.visibility,
                scheduled_at: quizData.scheduled_at,
                is_active: quizData.visibility === 'published'
            })
            .select()
            .single()

        if (quizError) throw quizError

        // 2. Clear existing questions if updating (simplest approach for MVP)
        if (quizData.id) {
            await supabase.from('cbt_questions').delete().eq('quiz_id', quiz.id)
        }

        // 3. Insert new questions
        const questionsToInsert = questions.map((q) => ({
            quiz_id: quiz.id,
            question_text: q.question_text,
            options: q.options,
            correct_option: q.correct_option,
            explanation: q.explanation,
            points: q.points || 1
        }))

        const { error: questionsError } = await supabase.from('cbt_questions').insert(questionsToInsert)
        if (questionsError) throw questionsError

        return { success: true, quizId: quiz.id }
    } catch (error) {
        console.error('Sync Error:', error)
        return { success: false, error: (error as Error).message }
    }
}

/**
 * Fetch all quizzes for a class and subject
 */
export async function getAllQuizzes(classId: string, subjectId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, data: [] }

    const { data: quizzes, error } = await supabase
        .from('cbt_quizzes')
        .select(`
            *,
            question_count:cbt_questions(count)
        `)
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching quizzes:', error)
        return { success: false, data: [] }
    }

    // Flatten count
    const formatted = quizzes.map(q => ({
        ...q,
        total_questions: q.question_count?.[0]?.count || 0
    }))

    return { success: true, data: formatted }
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(id: string) {
    const supabase = createClient()
    const { error } = await supabase
        .from('cbt_quizzes')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete error:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
