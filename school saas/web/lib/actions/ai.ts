'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GOOGLE_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

interface StudentPerformance {
    name: string
    average: number
    position: number
    totalStudents: number
    bestSubject: string
    worstSubject: string
    attendance: number // Percentage
}

/**
 * Generate a personalized remark for a student based on their performance
 */
export async function generateStudentRemark(performance: StudentPerformance): Promise<string> {
    if (!genAI) {
        return "AI Remark Engine is not configured. Please add GOOGLE_API_KEY to .env.local."
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `
            Act as a professional and encouraging school principal. Write a concise, 50-word performance remark for a student's report card.
            
            Student Name: ${performance.name}
            Average Score: ${performance.average}%
            Class Position: ${performance.position} out of ${performance.totalStudents}
            Best Subject: ${performance.bestSubject}
            Needs Improvement In: ${performance.worstSubject}
            Attendance: ${performance.attendance}%

            Tone: Formal but warm. Highlight strengths. For top-performing students (A grade), focus on commendation and maintaining excellence. For others, respectfully address areas for improvement and encourage future effort. Do not use emoji.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        return text.trim()
    } catch (error) {
        console.error("AI Generation Error:", error)
        if (performance.average >= 80) {
            return "An outstanding performance this term. Your dedication and hard work are clearly reflected in these results. Keep up the excellent standard!"
        }
        return "A good effort this term. Keep up the hard work and continue to focus on areas that need improvement for even better results."
    }
}
