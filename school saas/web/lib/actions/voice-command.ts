'use server'

import { model } from '@/lib/gemini'
import { getAdminStats } from './dashboard'

export type VoiceAction = 
  | { type: 'NAVIGATE'; path: string; message: string }
  | { type: 'QUERY_STAT'; data: string; message: string }
  | { type: 'SEARCH'; query: string; message: string }
  | { type: 'UNKNOWN'; message: string }

/**
 * AI Voice Command Processor (Platinum Edition) 🎙️🤖🏾🇳🇬
 * Translates audio data into dashboard actions using Gemini.
 */
export async function processVoiceCommand(audioBase64: string): Promise<VoiceAction> {
    try {
        const stats = await getAdminStats()
        const contextPrompt = `
            You are the EduFlow Platinum AI Assistant. 
            The user is a school proprietor or administrator.
            Current School Stats: ${JSON.stringify(stats)}

            Translate the following audio command into a structured JSON action.
            Possible actions:
            1. NAVIGATE: { "type": "NAVIGATE", "path": "/dashboard/...", "message": "Redirecting you to..." }
            2. QUERY_STAT: { "type": "QUERY_STAT", "data": "Specific stat answer", "message": "Here is the info..." }
            3. SEARCH: { "type": "SEARCH", "query": "name", "message": "Searching for..." }
            
            Return ONLY the valid JSON.
        `

        const result = await model.generateContent([
            contextPrompt,
            {
                inlineData: {
                    data: audioBase64,
                    mimeType: "audio/webm" // MediaRecorder default
                }
            }
        ])

        const response = await result.response
        const text = response.text().trim()
        
        // Clean markdown backticks if AI returns them
        const jsonStr = text.replace(/```json|```/g, '').trim()
        const action = JSON.parse(jsonStr) as VoiceAction

        return action
    } catch (error) {
        console.error("Voice Processing Error:", error)
        return { 
            type: 'UNKNOWN', 
            message: "I couldn't quite understand that command. Please try again with a clear voice." 
        }
    }
}
