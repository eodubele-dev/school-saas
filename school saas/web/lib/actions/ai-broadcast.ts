"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

export async function generateBroadcastAI(topic: string, tone: string, channel: 'sms' | 'whatsapp' | 'email') {
    try {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GEMINI_API_KEY
        if (!apiKey) {
            return { success: false, error: "AI Configuration missing. Please set GOOGLE_API_KEY in your environment." }
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        const MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]

        let prompt = ""

        if (channel === 'sms') {
            prompt = `
            Act as an expert school administrator. Write a highly concise TEXT MESSAGE/SMS about: "${topic}".
            
            Guidelines:
            - **Tone:** ${tone}.
            - **Length:** STRICTLY UNDER 160 CHARACTERS.
            - **Formatting:** Plain text only. Keep it short, actionable, and clear. Do not use emojis to save space. 
            - **Output:** Output ONLY the exact message to be sent. Do not include any quotation marks, greetings like 'Dear Parent', or signature lines unless essential to the message. No markdown.
            `
        } else if (channel === 'whatsapp') {
            prompt = `
            Act as an expert school administrator and PR specialist. Write a friendly WHATSAPP BROADCAST about: "${topic}".
            
            Guidelines:
            - **Tone:** ${tone}, warm, and professional.
            - **Length:** 2-3 short paragraphs maximum.
            - **Formatting:** Use WhatsApp markdown (*bold* and _italics_) appropriately. Include 2-3 highly relevant emojis to make it engaging but not unprofessional.
            - **Output:** Output ONLY the exact prepared message. Do not include any surrounding codeblocks.
            `
        } else {
            prompt = `
            Act as an expert school administrator. Write an EMAIL BROADCAST about: "${topic}".
            
            Guidelines:
            - **Tone:** ${tone}, professional, and formal.
            - **Formatting:** Provide a clear Subject Line at the very top (e.g. "Subject: ..."), followed by two line breaks, then the body of the email.
            - **Output:** Output ONLY the exact text. Do not use HTML or Markdown code blocks.
            `
        }

        const errors: string[] = []

        for (const modelName of MODELS_TO_TRY) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName })
                const result = await model.generateContent(prompt)
                const response = await result.response
                const text = response.text()

                if (text) {
                    return { success: true, content: text.trim().replace(/^"|"$/g, '').trim() }
                }
            } catch (err: any) {
                const errMsg = err.message || "Unknown model error"
                errors.push(`${modelName}: ${errMsg}`)
                if (errMsg.includes("API key") || errMsg.includes("quota")) break
            }
        }

        return {
            success: false,
            error: `AI Failed to generate format. Check AI connectivity.\nDetails:\n${errors.join("\n")}`
        }

    } catch (e: any) {
        return { success: false, error: e.message || "Critical AI Integration Error" }
    }
}
