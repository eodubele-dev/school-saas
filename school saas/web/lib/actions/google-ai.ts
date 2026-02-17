'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"

/**
 * 1. AI Generation
 * Generates structured content based on NERDC standards.
 * Moved to a dedicated file to resolve Server Action routing issues.
 */
export async function generateLessonPlanAI(topic: string, subject: string, level: string, week: string, type: 'lesson_plan' | 'lesson_note' = 'lesson_plan') {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GEMINI_API_KEY

        if (!apiKey) {
            return {
                success: false,
                error: "AI Configuration missing. Please set GOOGLE_API_KEY."
            }
        }

        const genAI = new GoogleGenerativeAI(apiKey)

        // Recommended models based on your project's diagnostic check
        const MODELS_TO_TRY = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-pro",
            "gemini-1.0-pro"
        ]

        let prompt = ""
        if (type === 'lesson_plan') {
            prompt = `
            Act as an expert Nigerian curriculum developer. Create a detailed **LESSON PLAN** for:
            - **Subject:** ${subject}
            - **Topic:** ${topic}
            - **Class Level:** ${level}
            - **Week:** ${week}

            **Standards:** Use NERDC format. Clear headings (<h2>/<h3>). Robust spacing between sections. **Bold** key terms.
            **Output:** Return ONLY valid HTML code inside a div. No markdown blocks.
            `
        } else {
            prompt = `
            Act as an expert subject teacher creating a **PREMIUM STUDENT LESSON NOTE** for:
            - **Subject:** ${subject}
            - **Topic:** ${topic}
            - **Class:** ${level}
            - **Week:** ${week}

            ** Standards:** Visually organized, easy to read, WAEC/NECO standard.
            **Formatting:** Higher line-height, bold definitions, bullet lists, <table> for comparisons.
            **Structure:** Header, Introduction, Core Content (Detailed), Real-Life Context (Nigeria), Summary, Practice Questions.
            **Output:** Return ONLY valid HTML code inside a div. No markdown blocks.
            `
        }

        const errors: string[] = []

        for (const modelName of MODELS_TO_TRY) {
            try {
                console.log(`[AI_ATTEMPT] Trying ${modelName}...`)
                const model = genAI.getGenerativeModel({ model: modelName })
                const result = await model.generateContent(prompt)
                const response = await result.response
                const text = response.text()

                if (text) {
                    return { success: true, content: text.replace(/```html/g, "").replace(/```/g, "") }
                }
            } catch (err: any) {
                const errMsg = err.message || "Unknown model error"
                console.warn(`[AI_FAILED] ${modelName}: ${errMsg}`)
                errors.push(`${modelName}: ${errMsg}`)
                if (errMsg.includes("API key") || errMsg.includes("quota")) break
            }
        }

        return {
            success: false,
            error: `AI Failed to generate content. Please check your API key and permissions.\n\nAttempts:\n${errors.join("\n")}`
        }
    } catch (fatal: any) {
        console.error("[AI_FATAL]", fatal)
        return {
            success: false,
            error: `Interface Error: ${fatal.message || "Critical failure"}`
        }
    }
}
