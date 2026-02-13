'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendAbsentNotification } from './attendance'

export interface StudentAttendanceDTO {
    student_id: string
    status: 'present' | 'absent' | 'excused' | 'late'
    remarks?: string
}

/**
 * Get the class assigned to the current teacher
 */
export async function getAssignedClass() {
    const supabase = createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        // Find in teacher_allocations
        const { data: allocation, error } = await supabase
            .from('teacher_allocations')
            .select('class_id, classes(name)')
            .eq('teacher_id', user.id)
            .limit(1)
            .maybeSingle()

        if (error) throw error
        if (!allocation) return { success: false, error: 'No class assigned' }

        return {
            success: true,
            data: {
                id: allocation.class_id,
                name: (allocation.classes as any)?.name || 'Unknown Class'
            }
        }
    } catch (error) {
        console.error('getAssignedClass error:', error)
        return { success: false, error: 'Failed to fetch assigned class' }
    }
}

/**
 * Get students in a specific class
 */
export async function getClassStudents(classId: string) {
    const supabase = createClient()
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('id, first_name, last_name, admission_number, photo_url')
            .eq('class_id', classId)
            .order('first_name')

        if (error) throw error
        return { success: true, data: students }
    } catch (error) {
        console.error('getClassStudents error:', error)
        return { success: false, error: 'Failed to fetch students' }
    }
}

/**
 * Mark attendance for students
 */
export async function markStudentAttendance(classId: string, date: string, records: StudentAttendanceDTO[]) {
    const supabase = createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile) return { success: false, error: 'Profile not found' }

        const payload = records.map(record => ({
            tenant_id: profile.tenant_id,
            student_id: record.student_id,
            class_id: classId,
            date,
            status: record.status,
            notes: record.remarks,
            marked_by: user.id,
            marked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))

        const { error } = await supabase
            .from('student_attendance')
            .upsert(payload, { onConflict: 'student_id,date' })

        if (error) throw error

        revalidatePath('/dashboard/teacher/attendance')
        return { success: true }
    } catch (error) {
        console.error('markStudentAttendance error:', error)
        return { success: false, error: 'Failed to save attendance' }
    }
}

/**
 * Send SMS notifications for absent students
 */
export async function sendAbsenceSMS(studentIds: string[]) {
    try {
        const date = new Date().toISOString().split('T')[0]
        const results = await Promise.all(
            studentIds.map(id => sendAbsentNotification(id, date, 'absent'))
        )

        const successCount = results.filter(r => r.success).length
        return { success: successCount > 0, count: successCount }
    } catch (error) {
        console.error('sendAbsenceSMS error:', error)
        return { success: false, error: 'Failed to send notifications' }
    }
}

/**
 * Get attendance history and stats for a student
 */
export async function getStudentAttendanceHistory() {
    const supabase = createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { history: [], stats: null }

        const { data: history, error } = await supabase
            .from('student_attendance')
            .select('date, status, notes')
            .eq('student_id', user.id)
            .order('date', { ascending: false })

        if (error) throw error

        const stats = {
            present: history?.filter(r => r.status === 'present').length || 0,
            late: history?.filter(r => r.status === 'late').length || 0,
            absent: history?.filter(r => r.status === 'absent').length || 0,
            excused: history?.filter(r => r.status === 'excused').length || 0,
            streak: 0 // Simplified
        }

        // Simple streak calculation (consecutive present days)
        if (history && history.length > 0) {
            let streak = 0
            for (const record of history) {
                if (record.status === 'present') streak++
                else break
            }
            stats.streak = streak
        }

        return { history: history || [], stats }
    } catch (error) {
        console.error('getStudentAttendanceHistory error:', error)
        return { history: [], stats: null }
    }
}
