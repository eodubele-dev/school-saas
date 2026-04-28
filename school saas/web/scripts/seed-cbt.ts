import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedPastQuestions() {
    // 1. Get ALL tenant IDs
    const { data: tenants } = await supabase.from('tenants').select('id')
    if (!tenants || tenants.length === 0) {
        console.error("No tenants found to seed questions for.")
        return
    }

    const subjects = [
        'Mathematics', 'English Language', 'Physics', 'Chemistry', 
        'Biology', 'Economics', 'Government', 'Commerce', 'Financial Accounting'
    ]
    const examTypes = ['JAMB', 'WAEC', 'NECO']
    const years = [2023, 2022, 2021, 2020]

    const questions: any[] = []

    tenants.forEach(tenant => {
        subjects.forEach(subject => {
            examTypes.forEach(examType => {
                years.forEach(year => {
                    // Add 2-3 sample questions for each combination to make the list look full
                    questions.push({
                        tenant_id: tenant.id,
                        subject,
                        exam_type: examType,
                        year,
                        question_text: `Sample ${examType} ${subject} question for ${year}. This is a place-holder following the Nigerian Education Syllabus.`,
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correct_option: 0,
                        explanation: `This is a syllabus-compliant explanation for ${subject}.`
                    })
                })
            })
        })
    })

    console.log(`Preparing to insert ${questions.length} questions across ${tenants.length} tenants...`)

    // Insert in batches of 500 to avoid Supabase limits
    for (let i = 0; i < questions.length; i += 500) {
        const batch = questions.slice(i, i + 500)
        const { error } = await supabase.from('past_questions').insert(batch)
        if (error) {
            console.error(`Error seeding batch ${i / 500}:`, error)
            break
        }
    }
    if (error) console.error("Error seeding questions:", error)
    else console.log("Successfully seeded 3 past questions.")
}

seedPastQuestions()
