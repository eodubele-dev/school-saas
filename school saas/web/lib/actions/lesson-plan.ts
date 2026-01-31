'use server'

import { model } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'

export async function generateSyllabus(subject: string, className: string, topic?: string) {
    try {
        const prompt = `
            Act as an Expert Curriculum Developer for the Nigerian National Curriculum (NERDC).
            
            Task:
            Create a comprehensive 13-Week Lesson Plan / Syllabus for:
            - Subject: ${subject}
            - Class: ${className}
            ${topic ? `- Focus Topic: ${topic}` : ''}
            
            Structure Guidelines:
            1.  **Format**: strict JSON array of objects.
            2.  **Fields**: 'week' (number), 'topic' (string), 'learning_objectives' (array of strings), 'activities' (array of strings), 'resources' (array of strings).
            3.  **Content**: Must align with Nigerian educational standards.
            
            Output Example:
            [
              {
                week_number: (plan as { week_number?: number }).week_number,
            topic: (plan as { topic?: string }).topic,
            learning_objectives: (plan as { learning_objectives?: string[] }).learning_objectives || [],
            activities: (plan as { activities?: string[] }).activities || [],
            resources: (plan as { resources?: string[] }).resources || []
              },
              ...
            ]
            
            Provide ONLY the JSON array. No markdown blocks.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim()

        const syllabus = JSON.parse(text)

        // Save to Database (Optional: Could just return to UI first)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

            if (profile) {
                await supabase.from('lesson_plans').insert({
                    tenant_id: profile.tenant_id,
                    title: `${subject} - ${className} (13-Week Plan)`,
                    content: JSON.stringify(syllabus),
                    subject: subject,
                    // class_id would need valid ID, skipping for demo simplicity or use mock
                })
            }
        }

        return { success: true, data: syllabus }

    } catch (error) {
        console.error("Syllabus Gen Error:", error)
        return { success: false, error: (error as Error).message }
    }
}
