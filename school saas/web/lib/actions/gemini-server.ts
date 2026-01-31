'use server'

import { model } from '@/lib/gemini'

interface StudentScores {
    name: string
    average: number
    position: number
    totalStudents: number
    bestSubject: string
    worstSubject: string
    attendance: number
}

/**
 * Generates a professional 3-sentence academic narrative for a Nigerian report card.
 */
export async function generateStudentRemark(scores: StudentScores): Promise<string> {
    const prompt = `
        Act as a Senior Principal of a prestigious Nigerian Private School.
        Your tone must be strictly formal, academically rigorous, and encouraging.
        Write a concise, exactly 3-sentence remark for a student's report card.

        Student Data:
        - Name: ${scores.name}
        - Average: ${scores.average}%
        - Position: ${scores.position} out of ${scores.totalStudents}
        - Best Subject: ${scores.bestSubject}
        - Weakest Subject: ${scores.worstSubject}
        - Attendance: ${scores.attendance}%

        Strict Rules:
        1. Use British English spelling (e.g., 'Behaviour', 'Programme', 'Centre').
        2. Refer to 'Term' and 'Continuous Assessment' (CA). Never use 'Semester' or 'Grade'.
        3. No slang. Use dignified vocabulary (e.g., 'Commendable', 'Diligence', 'Satisfactory').
        4. Logic:
           - If Average < 40%: Be firm but constructive. (e.g., "A more disciplined approach is required...").
           - If Average > 80%: Be celebratory but challenging. (e.g., "Outstanding performance; must maintain this momentum...").
        5. Structure:
           - Sentence 1: Comment on overall standing/position and effort.
           - Sentence 2: Mention the best subject and advise on the weakest subject.
           - Sentence 3: Future-facing advice for the next Term.
        6. NO emojis. NO bullet points. Just text.
    `

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error("Gemini Generation Error:", error)
        return "An excellent performance this term. ${scores.name} has shown diligence in ${scores.bestSubject} but needs more focus in ${scores.worstSubject}. We expect even better results next term."
    }
}
