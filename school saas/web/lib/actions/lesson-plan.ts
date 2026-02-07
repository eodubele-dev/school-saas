'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface LessonPlan {
    id: string
    title: string
    content: string
    subject: string
    term: string
    week: string
    date: string
    is_published: boolean
    class_id: string
    teacher_id: string
}

/**
 * 1. AI Generation (Stub)
 * Generates structured content based on NERDC standards.
 */
export async function generateLessonPlanAI(topic: string, subject: string, level: string, week: string) {
    // Stub for Gemini 1.5 Flash
    // We mock the structured response HTML
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate 2s delay

    const content = `
    <h2>Topic: ${topic}</h2>
    <p><strong>Class:</strong> ${level} | <strong>Week:</strong> ${week}</p>
    
    <h3>1. Behavioral Objectives</h3>
    <p>By the end of the lesson, students should be able to:</p>
    <ul>
        <li>Define the concept of ${topic} clearly.</li>
        <li>Identify at least three examples relevant to the Nigerian context.</li>
        <li>Explain the importance of ${topic} in daily life.</li>
    </ul>

    <h3>2. Instructional Materials</h3>
    <p>Textbooks, Charts showing ${topic}, and local examples such as nearby market items or household tools.</p>

    <h3>3. Introduction</h3>
    <p>The teacher introduces the lesson by asking students to mention what they know about ${topic}. The teacher creates a link between their prior knowledge and the new topic.</p>

    <h3>4. Presentation</h3>
    <ul>
        <li><strong>Step 1:</strong> Teacher explains the definition of ${topic}.</li>
        <li><strong>Step 2:</strong> Teacher demonstrates usage using the instructional materials.</li>
        <li><strong>Step 3:</strong> Students are asked to give their own examples.</li>
    </ul>

    <h3>5. Evaluation (WAEC/JAMB Style)</h3>
    <ol>
        <li>Which of the following best describes ${topic}?<br/> A) Option A <br/> B) Option B <br/> C) Option C</li>
        <li>Mention two applications of ${topic} in Nigeria.</li>
    </ol>

    <h3>6. Conclusion</h3>
    <p>The teacher summarizes the key points and gives an assignment for the next class.</p>
    `

    return { success: true, content }
}

/**
 * 2. Save Lesson Plan
 */
export async function saveLessonPlan(data: Partial<LessonPlan>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    const payload = {
        title: data.title,
        content: data.content,
        subject: data.subject,
        term: data.term,
        week: data.week,
        class_id: data.class_id,
        is_published: data.is_published,
        teacher_id: user.id,
        tenant_id: profile?.tenant_id,
        date: new Date().toISOString()
    }

    const { error } = await supabase
        .from('lesson_plans')
        .upsert(data.id ? { ...payload, id: data.id } : payload)

    if (error) {
        console.error(error)
        throw new Error(error.message || "Failed to save")
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

/**
 * 3. Fetch Plans
 */
export async function getLessonPlans() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, data: [] }
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    const { data } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('tenant_id', profile?.tenant_id)
        .order('created_at', { ascending: false })

    return { success: true, data: data || [] }
}
