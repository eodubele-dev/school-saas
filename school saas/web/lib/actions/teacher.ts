'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLessonPlan(formData: FormData) {
    const supabase = createClient()

    // Get current user (teacher)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Not authenticated')
    }

    // Get teacher profile to find tenant_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, id')
        .eq('id', user.id)
        .single()

    if (!profile) {
        throw new Error('Profile not found')
    }

    const title = formData.get('title') as string
    const subject = formData.get('subject') as string
    const date = formData.get('date') as string
    const content = formData.get('content') as string
    // In a real app, we would select a class_id from a dropdown. 
    // For now, we might leave it null or pick the first class found.

    const { error } = await supabase.from('lesson_plans').insert({
        title,
        subject,
        date,
        content,
        tenant_id: profile.tenant_id,
        teacher_id: profile.id
    })

    if (error) {
        console.error('Error creating lesson:', error)
        // In production, return meaningful error state
        return { error: error.message }
    }

    revalidatePath('/lesson-plans')
    redirect('/lesson-plans')
}

export async function getLessonPlans() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('lesson_plans')
        .select('*')
        .eq('teacher_id', user.id)
        .order('date', { ascending: false })

    return data || []
}
