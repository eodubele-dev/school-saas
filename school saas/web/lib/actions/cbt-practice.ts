'use server'

import { createClient } from '@/lib/supabase/server'

export interface PastQuestion {
    id: string
    question_text: string
    options: string[]
    correct_option: number
    explanation: string
}

export async function getPastQuestions(subject: string, examType: string, year?: string) {
    const supabase = createClient()

    let query = supabase
        .from('past_questions')
        .select('*')
        .eq('subject', subject)
        .eq('exam_type', examType)

    if (year) {
        query = query.eq('year', parseInt(year))
    }

    // Limit for practice session (e.g., 20 random Qs)
    // Note: Supabase random() support varies, doing client shuffle or limiting here. 
    // For MVP, just taking first 50.
    const { data, error } = await query.limit(50)

    if (error) {
        console.error("Fetch Error:", error)
        return []
    }

    return data as PastQuestion[]
}
