'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PendingItem {
    id: string
    type: 'lesson_plan' | 'gradebook'
    title: string
    submitted_by: string
    submitted_at: string
    status: string
    details?: any // Extra data like content or subject/class
}

/**
 * Fetch Pending Approvals
 * Cubes: Lesson Plans (pending), Gradebooks (is_locked=true but not yet officially "approved" if we add that layer, 
 * for now we just treat locked gradebooks as items to review)
 */
export async function getPendingApprovals() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, data: [] }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    // 1. Fetch Pending Lesson Plans
    const { data: plans } = await supabase
        .from('lesson_plans')
        .select(`
            id, title, created_at, approval_status, content,
            teacher:profiles!teacher_id(full_name)
        `)
        .eq('tenant_id', profile?.tenant_id)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })

    // 2. Fetch Locked Gradebooks (Simulated query for now as we treat 'is_locked' as submitted)
    // In a real app, we might have a separate 'gradebook_submissions' table. 
    // For this MVP, we'll fetch a mock list or just query 'student_grades' for unique locked classes if possible, 
    // but that's heavy. Let's stick to Lesson Plans for the "Real" interactive part, 
    // and mock Gradebook waiting list to demonstrate the UI.

    const pendingItems: PendingItem[] = []

    if (plans) {
        plans.forEach(p => {
            pendingItems.push({
                id: p.id,
                type: 'lesson_plan',
                title: p.title,
                submitted_by: p.teacher?.full_name || 'Unknown Teacher',
                submitted_at: p.created_at,
                status: 'pending',
                details: { content: p.content } // Pass content for review modal
            })
        })
    }

    // Mock Gradebook Submission
    pendingItems.push({
        id: 'mock-gb-1',
        type: 'gradebook',
        title: 'JSS 1 Mathematics - 1st Term',
        submitted_by: 'Mr. David Okeke',
        submitted_at: new Date().toISOString(),
        status: 'pending'
    })

    return { success: true, data: pendingItems }
}

/**
 * Approve Item
 */
export async function approveItem(id: string, type: 'lesson_plan' | 'gradebook') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    if (type === 'lesson_plan') {
        // Update Lesson Plan
        const { error } = await supabase
            .from('lesson_plans')
            .update({
                approval_status: 'approved',
                approved_by: user.id,
                approved_at: new Date().toISOString(),
                rejection_reason: null
            })
            .eq('id', id)

        if (error) return { success: false, error: error.message }

        // Audit Log
        await supabase.from('audit_logs').insert({
            tenant_id: profile?.tenant_id,
            action: 'approve',
            entity_type: 'lesson_plan',
            entity_id: id,
            performed_by: user.id,
            details: { previous_status: 'pending' }
        })
    } else {
        // Mock Gradebook Approval
        await new Promise(r => setTimeout(r, 1000)) // Simulate
    }

    revalidatePath('/dashboard/admin/approvals')
    return { success: true }
}

/**
 * Reject Item
 */
export async function rejectItem(id: string, type: 'lesson_plan' | 'gradebook', reason: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    if (type === 'lesson_plan') {
        // Update Lesson Plan
        const { error } = await supabase
            .from('lesson_plans')
            .update({
                approval_status: 'rejected',
                rejection_reason: reason,
                approved_by: null,
                approved_at: null
            })
            .eq('id', id)

        if (error) return { success: false, error: error.message }

        // Audit Log
        await supabase.from('audit_logs').insert({
            tenant_id: profile?.tenant_id,
            action: 'reject',
            entity_type: 'lesson_plan',
            entity_id: id,
            performed_by: user.id,
            details: { reason }
        })
    }

    revalidatePath('/dashboard/admin/approvals')
    return { success: true }
}
