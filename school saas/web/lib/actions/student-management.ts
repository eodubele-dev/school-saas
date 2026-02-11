'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TransferResult {
    success: boolean
    message: string
}

export async function transferStudent(studentId: string, newClassId: string, reason: string): Promise<TransferResult> {
    const supabase = createClient()

    try {
        // 1. Validate Admin Role
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, message: 'Unauthorized' }

        // 2. Perform Transfer
        const { error } = await supabase
            .from('students')
            .update({
                class_id: newClassId,
                updated_at: new Date().toISOString()
            })
            .eq('id', studentId)

        if (error) throw error

        // 3. Log Transfer (Optional - could go to an audit table)
        console.log(`[Transfer] Student ${studentId} moved to Class ${newClassId} by ${user.id}. Reason: ${reason}`)

        // 4. Revalidate
        revalidatePath('/dashboard/admin/students')
        return { success: true, message: 'Student transferred successfully' }

    } catch (error: any) {
        console.error('Transfer Error:', error)
        return { success: false, message: error.message || 'Failed to transfer student' }
    }
}

export async function bulkTransferStudents(studentIds: string[], newClassId: string, reason: string): Promise<TransferResult> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, message: 'Unauthorized' }

        if (!studentIds.length) return { success: false, message: 'No students selected' }

        const { error } = await supabase
            .from('students')
            .update({
                class_id: newClassId,
                updated_at: new Date().toISOString()
            })
            .in('id', studentIds)

        if (error) throw error

        console.log(`[Bulk Transfer] ${studentIds.length} students moved to Class ${newClassId} by ${user.id}. Reason: ${reason}`)

        revalidatePath('/dashboard/admin/students')
        return { success: true, message: `Successfully promoted ${studentIds.length} students` }

    } catch (error: any) {
        console.error('Bulk Transfer Error:', error)
        return { success: false, message: error.message || 'Failed to transfer students' }
    }
}

export async function getAllStudents() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. Get the current user's tenant_id if not provided
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

    // Fetch students with class info for the specific tenant
    const { data, error } = await supabase
        .from('students')
        .select(`
            id, 
            full_name, 
            admission_number, 
            status, 
            passport_url,
            classes (id, name, grade_level)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('full_name')

    if (error) {
        console.error('Fetch Students Error:', error)
        return []
    }

    return data.map(s => {
        const classInfo = Array.isArray(s.classes) ? s.classes[0] : s.classes
        return {
            id: s.id,
            name: s.full_name,
            admissionNo: s.admission_number,
            class: classInfo?.name || 'Unassigned',
            classId: classInfo?.id,
            status: s.status || 'Active',
            avatar: s.passport_url
        }
    })
}

export async function getAllClasses() {
    const supabase = createClient()
    const { data } = await supabase
        .from('classes')
        .select('id, name')
        .order('name')

    return data || []
}
