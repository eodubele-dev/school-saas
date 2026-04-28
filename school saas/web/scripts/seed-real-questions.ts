import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY

async function generateRealQuestions(subject: string, examType: string, year: number) {
    console.log(`Generating real ${examType} ${subject} questions for ${year}...`)
    
    const prompt = `
        Generate 25 high-quality practice multiple-choice questions for the Nigerian ${examType} syllabus in ${subject} for the year ${year}.
        Ensure they are academically rigorous and follow NERDC/JAMB standards.
        Return strictly as a JSON array: [{"question_text": "...", "options": ["A", "B", "C", "D"], "correct_option": 0, "explanation": "..."}]
    `

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        })

        const result = await response.json()
        console.log("AI Result Status:", response.status)
        if (result.error) console.error("AI Error:", result.error)

        let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "[]"
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()
        
        return JSON.parse(text)
    } catch (error) {
        console.error("AI Generation failed:", error)
        return []
    }
}

async function seedRealQuestions() {
    const subjects = [
        'Mathematics', 'English Language', 'Physics', 'Chemistry', 
        'Biology', 'Economics', 'Government', 'Literature-in-English',
        'Christian Religious Studies', 'Commerce'
    ]
    const examTypes = ['JAMB', 'WAEC', 'NECO']
    const years = [2025, 2024, 2023, 2022, 2021, 2020]

    const { data: tenants } = await supabase.from('tenants').select('id')
    console.log(`Found ${tenants?.length || 0} tenants.`)
    if (!tenants || tenants.length === 0) return

    console.log("Purging old questions to make room for high-volume data...")
    await supabase.from('past_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    for (const subject of subjects) {
        for (const examType of examTypes) {
            for (const year of years) {
                // Generate 50 questions in 2 batches of 25 for better reliability
                for (let batchNum = 1; batchNum <= 2; batchNum++) {
                    const aiQuestions = await generateRealQuestions(subject, examType, year)
                    
                    if (aiQuestions.length > 0) {
                        const toInsert = tenants.flatMap(tenant => 
                            aiQuestions.map((q: any) => ({
                                tenant_id: tenant.id,
                                subject,
                                exam_type: examType,
                                year,
                                ...q
                            }))
                        )

                        console.log(`[Batch ${batchNum}] Inserting ${toInsert.length} questions for ${subject} ${examType} ${year}...`)
                        
                        for (let i = 0; i < toInsert.length; i += 500) {
                            const { error } = await supabase.from('past_questions').insert(toInsert.slice(i, i + 500))
                            if (error) console.error("Insert Error:", error)
                        }
                    }

                    // Delay for rate limiting
                    await new Promise(resolve => setTimeout(resolve, 2000))
                }
            }
        }
    }

    console.log("High-Volume Real Question Seeding Completed.")
}

seedRealQuestions()
