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
    approval_status: 'draft' | 'pending' | 'approved' | 'rejected'
    rejection_reason?: string
    type: 'lesson_plan' | 'lesson_note'
    status?: string // 'published' = pushed to student view
}

/**
 * Save Lesson Plan
 */
export async function saveLessonPlan(data: Partial<LessonPlan>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    // If updating, fetch existing status to preserve it unless explicitly changed
    let currentStatus = data.approval_status || 'draft'

    if (data.id && !data.approval_status) {
        const { data: existing } = await supabase.from('lesson_plans').select('approval_status').eq('id', data.id).single()
        if (existing) currentStatus = existing.approval_status
    }

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
        approval_status: currentStatus,
        type: data.type || 'lesson_plan'
    }

    const { error } = await supabase
        .from('lesson_plans')
        .upsert(data.id ? { ...payload, id: data.id } : { ...payload, created_at: new Date().toISOString() })

    if (error) {
        console.error(error)
        // DEBUG: Write detailed error to a file for AI agent to read
        const fs = require('fs');
        const logPath = 'C:\\projects\\school saas\\web\\save_error_log.txt';
        try {
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] SAVE ERROR: ${JSON.stringify(error)} \nPAYLOAD: ${JSON.stringify(payload)}\n\n`);
        } catch (e) {
            console.error("Failed to write log", e)
        }

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
        .update({ approval_status: 'pending' })
        .eq('id', id)
        .eq('teacher_id', user.id)

    if (error) {
        console.error("Error submitting plan:", error)
        throw new Error("Failed to submit plan")
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
