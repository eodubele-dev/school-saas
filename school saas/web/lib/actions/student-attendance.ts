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

        // 1. Check Form Teacher (Priority)
        const { data: formClass } = await supabase
            .from('classes')
            .select('id, name')
            .eq('form_teacher_id', user.id)
            .limit(1)
            .maybeSingle()

        if (formClass) {
            return {
                success: true,
                data: { id: formClass.id, name: formClass.name }
            }
        }

        // 2. Check Subject Assignments
        const { data: subjectAssign } = await supabase
            .from('subject_assignments')
            .select('class_id, classes(name)')
            .eq('teacher_id', user.id)
            .limit(1)
            .maybeSingle()

        if (subjectAssign && subjectAssign.classes) {
            return {
                success: true,
                data: {
                    id: subjectAssign.class_id,
                    name: (subjectAssign.classes as any).name
                }
            }
        }

        // 3. Check Allocations (Legacy)
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
            .select('id, full_name, admission_number, photo_url')
            .eq('class_id', classId)
            .order('full_name')

        if (error) throw error

        // Map to match expected DTO
        const mappedStudents = students.map((s: any) => {
            const names = s.full_name?.split(' ') || ['Unknown']
            return {
                id: s.id,
                first_name: names[0],
                last_name: names.slice(1).join(' ') || '',
                admission_number: s.admission_number || 'N/A',
                photo_url: s.photo_url,
                full_name: s.full_name
            }
        })

        return { success: true, data: mappedStudents }
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

        // 1. Get or Create Attendance Register
        const { data: register, error: regError } = await supabase
            .from('attendance_registers')
            .upsert({
                tenant_id: profile.tenant_id,
                class_id: classId,
                date: date,
                marked_by: user.id
            }, { onConflict: 'class_id,date' })
            .select('id')
            .single()

        if (regError || !register) {
            console.error('Error getting register:', regError)
            return { success: false, error: 'Failed to access attendance register' }
        }

        // 2. Prepare Payload with register_id
        const payload = records.map(record => {
            const isPresent = record.status === 'present'
            return {
                register_id: register.id,
                student_id: record.student_id,
                status: record.status,
                remarks: record.remarks,
                // Set clock_in_time if present. Ideally we check if it already exists to not overwrite, 
                // but for bulk markup we assume 'now'. In a refined version we'd use a COALESCE logic or separate update.
                // For this MVP: If marking present, set clock_in.
                clock_in_time: isPresent ? new Date().toISOString() : null
            }
        })

        // 3. Upsert Student Records (requires Unique constraint on student_id, register_id)
        const { error } = await supabase
            .from('student_attendance')
            .upsert(payload, { onConflict: 'register_id,student_id' })

        if (error) {
            console.error('Error saving records:', error)
            throw error
        }

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

export async function getClassAttendance(
    classId: string,
    date: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const supabase = createClient()

    try {
        // 1. Get Register ID for this class and date
        const { data: register } = await supabase
            .from('attendance_registers')
            .select('id')
            .eq('class_id', classId)
            .eq('date', date)
            .maybeSingle()

        if (!register) {
            return { success: true, data: [] }
        }

        // 2. Get Attendance Records using Register ID
        const { data, error } = await supabase
            .from('student_attendance')
            .select(`
                id,
                student_id,
                students!inner(full_name, parent_id, profiles(phone)),
                register_id,
                status,
                remarks,
                created_at,
                sms_sent,
                clock_out_time
            `)
            .eq('register_id', register.id)
            .order('students(full_name)')

        if (error) {
            console.error('Error fetching attendance:', error)
            return { success: false, error: error.message }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const records = (data || []).map((record: any) => ({
            id: record.id,
            student_id: record.student_id,
            student_name: record.students?.full_name || 'Unknown',
            class_id: classId, // mapped back from arg
            date: date,        // mapped back from arg
            status: record.status,
            marked_by: null,   // Not fetching marked_by for list view optimization
            marked_at: record.created_at,
            notes: record.remarks, // Mapped from remarks to notes
            sms_sent: record.sms_sent,
            parent_phone: record.students?.profiles?.phone || null,
            clock_out_time: record.clock_out_time
        }))

        return { success: true, data: records }

    } catch (error) {
        console.error('Error in getClassAttendance:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function getUnmarkedStudents(
    classId: string,
    date: string
): Promise<{ success: boolean; data?: Array<{ id: string; full_name: string }>; error?: string }> {
    const supabase = createClient()

    try {
        // Get all students in the class
        const { data: allStudents, error: studentsError } = await supabase
            .from('students')
            .select('id, full_name')
            .eq('class_id', classId)

        if (studentsError) {
            return { success: false, error: studentsError.message }
        }

        // Get Register ID
        const { data: register } = await supabase
            .from('attendance_registers')
            .select('id')
            .eq('class_id', classId)
            .eq('date', date)
            .maybeSingle()

        if (!register) {
            // No register means no one is marked
            return { success: true, data: allStudents || [] }
        }

        // Get students already marked for this register
        const { data: markedStudents, error: markedError } = await supabase
            .from('student_attendance')
            .select('student_id')
            .eq('register_id', register.id)

        if (markedError) {
            return { success: false, error: markedError.message }
        }

        const markedIds = new Set((markedStudents || []).map(s => s.student_id))
        const unmarked = (allStudents || []).filter(s => !markedIds.has(s.id))

        return { success: true, data: unmarked }

    } catch (error) {
        console.error('Error in getUnmarkedStudents:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Clock Out a Student
 */
export async function clockOutStudent(studentId: string, date: string, classId: string) {
    const supabase = createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        // 1. Get Register ID
        const { data: register } = await supabase
            .from('attendance_registers')
            .select('id')
            .eq('class_id', classId)
            .eq('date', date)
            .single()

        if (!register) return { success: false, error: 'No register found for this date. Mark attendance first.' }

        // 2. Update Student Attendance Record
        const { error } = await supabase
            .from('student_attendance')
            .update({
                clock_out_time: new Date().toISOString(),
                clocked_out_by: user.id,
                status: 'present' // Ensure they remain present
            })
            .eq('register_id', register.id)
            .eq('student_id', studentId)

        if (error) throw error

        revalidatePath('/dashboard/teacher/attendance')
        return { success: true }
    } catch (error) {
        console.error('clockOutStudent error:', error)
        return { success: false, error: 'Failed to clock out student' }
    }
}

export async function getRefreshedAttendanceStats(classId: string, date: string) {
    const supabase = createClient()

    try {
        // 1. Get Total Students
        const { count: total, error: totalError } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classId)

        if (totalError) throw totalError

        // 2. Get Register ID
        const { data: register } = await supabase
            .from('attendance_registers')
            .select('id')
            .eq('class_id', classId)
            .eq('date', date)
            .maybeSingle()

        if (!register) {
            return { success: true, total: total || 0, present: 0 }
        }

        // 3. Get Present Count for this Register
        const { count: present, error: presentError } = await supabase
            .from('student_attendance')
            .select('*', { count: 'exact', head: true })
            .eq('register_id', register.id)
            .eq('status', 'present')

        if (presentError) throw presentError

        return { success: true, total: total || 0, present: present || 0 }
    } catch (error) {
        console.error('Error fetching refreshed stats:', error)
        return { success: false, total: 0, present: 0 }
    }
}
