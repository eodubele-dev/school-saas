'use server'

import { createClient } from '@/lib/supabase/server'
import { Assignment } from '@/types/assignments'
import { revalidatePath } from 'next/cache'

export async function createAssignment(data: {
    title: string
    description: string
    dueDate: Date | undefined
    points: number
    classId: string
    subjectId: string
}) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        // Get tenant_id from profile
        const { data: profile } = await supabase.from('profiles').select('tenant_id, id').eq('id', user.id).single()
        if (!profile) throw new Error("Profile not found")

        const { error } = await supabase.from('assignments').insert({
            tenant_id: profile.tenant_id,
            teacher_id: profile.id,
            class_id: data.classId,
            subject_id: data.subjectId,
            title: data.title,
            description: data.description,
            due_date: data.dueDate?.toISOString(),
            points: data.points
        })

        if (error) {
            console.error('Error creating assignment:', error)
            return { success: false, error: 'Failed to create assignment' }
        }

        revalidatePath('/dashboard/teacher/assessments')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error creating assignment:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function getAssignments(classId: string, subjectId: string) {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('class_id', classId)
            .eq('subject_id', subjectId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching assignments:', error)
            return { success: false, error: 'Failed to fetch assignments' }
        }

        return { success: true, data: data as Assignment[] }
    } catch (error) {
        console.error('Unexpected error fetching assignments:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
