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
        Generate ${params.count} multiple-choice questions for ${params.subject} on the topic "${params.topic}".
        Difficulty Level: ${params.difficulty}

        Requirements:
        1. Each question must have exactly 4 options (A-D).
        2. Provide a clear "explanation" for the correct answer.
        3. Format the output as a strict JSON array.

        Output Format:
        [
          {
            "question_text": "...",
            "options": ["...", "...", "...", "..."],
            "correct_option": 0, (index 0-3)
            "explanation": "..."
          }
        ]
        
        Provide ONLY the JSON array. No markdown blocks.
    `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(text)
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
