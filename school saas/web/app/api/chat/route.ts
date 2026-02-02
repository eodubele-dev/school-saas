import { createClient } from "@/lib/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export async function POST(req: Request) {
    try {
        const { messages, domain } = await req.json()
        const lastMessage = messages[messages.length - 1].content

        // 1. Generate Embedding for the query
        // Note: Gemini embedding model
        const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" })
        const result = await embeddingModel.embedContent(lastMessage)
        const embedding = result.embedding.values

        // 2. Search Knowledge Base (RAG)
        const supabase = createClient()
        const { data: documents } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.7, // Adjust based on testing
            match_count: 3
        })

        // 3. Construct Context
        const contextText = documents?.map((doc: any) => doc.content).join("\n---\n") || ""

        // 4. Verification Step (Did we find anything?)
        // If low relevance, might fallback to general knowledge but bounded.

        // 5. Generate Response with Persona
        const systemPrompt = `
        You are 'EduFlow Assistant', the AI Help Desk for a school management platform.
        Your Persona: Patient, professional, and ultra-concise.
        
        CONTEXT FROM MANUAL:
        ${contextText}

        INSTRUCTIONS:
        - Answer the user's question using ONLY the context provided above.
        - If the answer involves navigating the app, provide a direct Direct Markdown URL link (e.g., [School Settings](/${domain}/dashboard/settings)).
        - If the context doesn't contain the answer, say "I couldn't find that in the manual. Would you like to speak to a human agent?"
        - Keep answers under 3 short sentences unless a list is required.
        - Tone: Helpful, Polite, "Platinum" Service.
        `

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] }, // Pre-prompting the persona
                // ... map previous history if needed, but for "Flash" speed and token economy, maybe just current turn or last 2
            ],
            generationConfig: {
                maxOutputTokens: 200,
            },
        })

        const response = await chat.sendMessage(lastMessage)
        const text = response.response.text()

        return Response.json({ text })

    } catch (error: any) {
        console.error("Chat API Error:", error)
        return Response.json({ error: error.message }, { status: 500 })
    }
}
