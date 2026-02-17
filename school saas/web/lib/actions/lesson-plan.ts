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
    status: 'draft' | 'submitted' | 'approved' | 'rejected'
    feedback?: string
    type: 'lesson_plan' | 'lesson_note'
}

/**
 * Save Lesson Plan
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
        status: data.status || 'draft',
        type: data.type || 'lesson_plan',
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
 * Fetch Plans
 */
export async function getLessonPlans() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, data: [] }
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    const { data, error } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', user.id)
        .eq('tenant_id', profile?.tenant_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Fetch plans error:", error)
        return { success: false, data: [] }
    }

    return { success: true, data: data || [] }
}

/**
 * Submit Lesson Plan for Approval
 */
export async function submitLessonPlan(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabase
        .from('lesson_plans')
        .update({ status: 'submitted' })
        .eq('id', id)
        .eq('teacher_id', user.id)

    if (error) {
        console.error("Error submitting plan:", error)
        throw new Error("Failed to submit plan")
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
