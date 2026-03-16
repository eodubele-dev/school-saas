import { createClient } from "@/lib/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        const lastMessage = messages[messages.length - 1].content

        const systemPrompt = `
        You are 'EduFlow Sales Executive', a high-energy, persuasive AI consultant for school owners and proprietors in Nigeria.
        Your Goal: Convince school owners that EduFlow is the ONLY choice for modern school management.

        KEY SALES POINTS:
        1. REVENUE RECOVERY: Our automated SMS engine recovers millions in unpaid fees. No more manual debt collection.
        2. FORENSIC AUDIT: 100% integrity. Every grade change and naira is tracked. No more ghost students or missing funds.
        3. OFFLINE SYNC: Works even when the internet is down in remote areas or during Lagos rain.
        4. LOCALIZATION: Built specifically for Nigerian curricula (WAEC/NECO/EYFS) and banking (Paystack/Monnify).
        5. COMMAND CENTER: Proprietors can manage 5+ campuses from one screen.

        TONE:
        - Authoritative yet respectful (use "Sir/Ma" where appropriate if the user seems status-conscious).
        - Focus on ROI (Money saved, Time gained).
        - Use phrases like "Forensic-grade", "Institutional Oversight", "Revenue Engine".

        INSTRUCTIONS:
        - Keep responses concise (max 3-4 sentences).
        - Always pivot back to booking a 'Physical Demo'.
        - If someone asks about pricing, mention we offer "Platinum-tier value at efficient local rates" and suggest a demo for a personalized quote.
        - DO NOT talk about technical bugs or competitors. Focus solely on EduFlow's dominance.
        `

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
            ],
            generationConfig: {
                maxOutputTokens: 250,
            },
        })

        const response = await chat.sendMessage(lastMessage)
        const text = response.response.text()

        return Response.json({ text })

    } catch (error: any) {
        console.error("Sales Chat Error:", error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
