'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateLessonParams {
    title: string
    content: string
    subject: string
    grade_level: string
    week: number
    subtopics?: string
}

export async function createLesson(data: CreateLessonParams) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Unauthorized" }
    }

    // Get tenant_id from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) {
        return { success: false, error: "Tenant not found" }
    }

    // Insert into 'lessons' table (Student Facing)
    const { error } = await supabase.from('lessons').insert({
        tenant_id: profile.tenant_id,
        title: data.title,
        content: data.content, // This might be HTML or Markdown
        subject: data.subject,
        grade_level: data.grade_level,
        topics: data.subtopics ? data.subtopics.split(',').map(s => s.trim()) : [],
        week: data.week,
        order_index: data.week // Simple ordering by week
    })

    if (error) {
        console.error("Failed to publish lesson:", error)
        throw new Error(error.message || "Failed to publish lesson")
    }

    revalidatePath('/dashboard/student/learning')
    return { success: true }
}
