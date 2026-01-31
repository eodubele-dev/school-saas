'use server'

import { model } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'
import * as pdf from 'pdf-parse'

/**
 * Server Action: Process PDF and Insert Questions
 */
export async function processPastQuestionsPdf(formData: FormData) {
    interface ExtractedQuestion {
        question_text: string
        options: string[]
        correct_option: number
        explanation: string
    }
    try {
        const file = formData.get('file') as File
        const subject = formData.get('subject') as string
        const examType = formData.get('examType') as string
        const year = formData.get('year') as string

        if (!file || !subject || !examType || !year) {
            return { success: false, error: "Missing required fields" }
        }

        // 1. Convert File to Buffer for pdf-parse
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 2. Extract Text
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfData = await (pdf as any).default(buffer)
        const pdfText = pdfData.text

        // 3. Prompt Gemini to Structure Data
        const prompt = `
            You are a Data Extraction Assistant.
            I will provide you with text from a PDF containing ${examType} Past Questions for ${subject} (${year}).

            Your Task:
            1. Parse the text and extract individual questions.
            2. Convert them into a structured JSON array.
            3. For each question, generate a concise 1-sentence explanation for why the correct answer is right.
            4. If the Correct Option is not explicitly marked in the text, SOLVE the question yourself to find the correct answer.

            Output Format (Strict JSON Array, no markdown):
            [
              {
                "question_text": "...",
                "options": ["A", "B", "C", "D"], (Ensure exactly 4 options if possible)
                "correct_option": 0, (Index of correct answer: 0=A, 1=B, 2=C, 3=D)
                "explanation": "..."
              }
            ]

            PDF Content:
            ${pdfText.slice(0, 30000)} // Truncate to avoid token limits if necessary, though 1.5 Flash has large context.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Clean markdown code blocks if present
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim()
        const parsedQuestions = JSON.parse(jsonString)

        // 4. Save to Database
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // Get Tenant
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

        if (!profile) return { success: false, error: "User profile not found" }

        const questionsToInsert = parsedQuestions.map((q: ExtractedQuestion) => ({
            tenant_id: profile.tenant_id,
            subject,
            exam_type: examType,
            year: parseInt(year),
            question_text: q.question_text,
            options: q.options,
            correct_option: q.correct_option,
            explanation: q.explanation
        }))

        const { error } = await supabase.from('past_questions').insert(questionsToInsert)

        if (error) throw error

        return { success: true, count: questionsToInsert.length }

    } catch (error) {
        console.error("PDF Upload Error:", error)
        return { success: false, error: (error as Error).message || "Failed to process PDF" }
    }
}
