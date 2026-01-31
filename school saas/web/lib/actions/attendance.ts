'use server'

import { createClient } from '@/lib/supabase/server'
import { termiiService, TermiiService } from '@/lib/services/termii'
import { revalidatePath } from 'next/cache'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

interface StudentAttendanceRecord {
    id: string
    student_id: string
    student_name: string
    class_id: string
    date: string
    status: AttendanceStatus
    marked_by: string | null
    marked_at: string | null
    notes: string | null
    sms_sent: boolean
    parent_phone: string | null
}

/**
 * Mark attendance for a single student
 */
export async function markStudentAttendance(
    studentId: string,
    classId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string
): Promise<{ success: boolean; error?: string; smsSent?: boolean }> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Get tenant ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return { success: false, error: 'Profile not found' }
        }

        // Upsert attendance record
        const { error } = await supabase
            .from('student_attendance')
            .upsert({
                student_id: studentId,
                class_id: classId,
                date,
                status,
                marked_by: user.id,
                marked_at: new Date().toISOString(),
                notes: notes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'student_id,date'
            })
            .select()
            .single()

        if (error) {
            console.error('Error marking attendance:', error)
            return { success: false, error: error.message }
        }

        // Send SMS if student is absent or late
        let smsSent = false
        if (status === 'absent' || status === 'late') {
            const smsResult = await sendAbsentNotification(studentId, date, status)
            smsSent = smsResult.success
        }

        revalidatePath('/attendance')
        return { success: true, smsSent }

    } catch (error) {
        console.error('Error in markStudentAttendance:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Mark attendance for multiple students (bulk action)
 */
export async function markBulkAttendance(
    students: Array<{ studentId: string; classId: string; status: AttendanceStatus }>,
    date: string
): Promise<{ success: boolean; marked: number; failed: number; errors: string[] }> {
    const results = {
        success: true,
        marked: 0,
        failed: 0,
        errors: [] as string[]
    }

    for (const student of students) {
        const result = await markStudentAttendance(
            student.studentId,
            student.classId,
            date,
            student.status
        )

        if (result.success) {
            results.marked++
        } else {
            results.failed++
            results.errors.push(`${student.studentId}: ${result.error}`)
        }
    }

    if (results.failed > 0) {
        results.success = false
    }

    return results
}

/**
 * Get attendance for a specific class on a specific date
 */
export async function getClassAttendance(
    classId: string,
    date: string
): Promise<{ success: boolean; data?: StudentAttendanceRecord[]; error?: string }> {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('student_attendance')
            .select(`
                id,
                student_id,
                students!inner(full_name, parent_id, profiles(phone)),
                class_id,
                date,
                status,
                marked_by,
                marked_at,
                notes,
                sms_sent
            `)
            .eq('class_id', classId)
            .eq('date', date)
            .order('students(full_name)')

        if (error) {
            console.error('Error fetching attendance:', error)
            return { success: false, error: error.message }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const records: StudentAttendanceRecord[] = (data || []).map((record: any) => ({
            id: record.id,
            student_id: record.student_id,
            student_name: record.students?.full_name || 'Unknown',
            class_id: record.class_id,
            date: record.date,
            status: record.status,
            marked_by: record.marked_by,
            marked_at: record.marked_at,
            notes: record.notes,
            sms_sent: record.sms_sent,
            parent_phone: record.students?.profiles?.phone || null
        }))

        return { success: true, data: records }

    } catch (error) {
        console.error('Error in getClassAttendance:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get students who haven't been marked for attendance today
 */
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

        // Get students already marked
        const { data: markedStudents, error: markedError } = await supabase
            .from('student_attendance')
            .select('student_id')
            .eq('class_id', classId)
            .eq('date', date)

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
 * Send SMS notification to parent about absent/late student
 */
export async function sendAbsentNotification(
    studentId: string,
    date: string,
    status: 'absent' | 'late'
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()

    try {
        // Get student and parent information
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select(`
                full_name,
                parent_id,
                profiles!students_parent_id_fkey(phone),
                classes!inner(name),
                tenants!inner(name)
            `)
            .eq('id', studentId)
            .single()

        if (studentError || !student) {
            console.error('Student not found:', studentError)
            return { success: false, error: 'Student not found' }
        }

        const parentPhone = (student.profiles as unknown as { phone: string })?.phone
        if (!parentPhone) {
            console.log('No parent phone number found for student:', studentId)
            return { success: false, error: 'No parent phone number' }
        }

        // Generate message
        const schoolName = (student.tenants as unknown as { name: string })?.name || 'School'
        const message = status === 'absent'
            ? TermiiService.generateAbsenceMessage(student.full_name, date, schoolName)
            : TermiiService.generateLateMessage(student.full_name, date, schoolName)

        // Send SMS
        const smsResult = await termiiService.sendSMS(parentPhone, message)

        if (smsResult.success) {
            // Update attendance record to mark SMS as sent
            await supabase
                .from('student_attendance')
                .update({
                    sms_sent: true,
                    sms_sent_at: new Date().toISOString()
                })
                .eq('student_id', studentId)
                .eq('date', date)

            return { success: true }
        }

        return { success: false, error: smsResult.error }

    } catch (error) {
        console.error('Error sending SMS:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get attendance statistics for a class
 */
export async function getAttendanceStats(
    classId: string,
    startDate: string,
    endDate: string
): Promise<{
    success: boolean
    data?: {
        totalDays: number
        presentCount: number
        absentCount: number
        lateCount: number
        excusedCount: number
        attendanceRate: number
    }
    error?: string
}> {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('student_attendance')
            .select('status')
            .eq('class_id', classId)
            .gte('date', startDate)
            .lte('date', endDate)

        if (error) {
            return { success: false, error: error.message }
        }

        const stats = {
            totalDays: data?.length || 0,
            presentCount: data?.filter(r => r.status === 'present').length || 0,
            absentCount: data?.filter(r => r.status === 'absent').length || 0,
            lateCount: data?.filter(r => r.status === 'late').length || 0,
            excusedCount: data?.filter(r => r.status === 'excused').length || 0,
            attendanceRate: 0
        }

        if (stats.totalDays > 0) {
            stats.attendanceRate = Math.round((stats.presentCount / stats.totalDays) * 100)
        }

        return { success: true, data: stats }

    } catch (error) {
        console.error('Error in getAttendanceStats:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get classes for the current teacher
 */
export async function getTeacherClasses(): Promise<{ success: boolean; data?: { id: string; name: string }[]; error?: string }> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        // In a real scenario, we might check a 'teacher_classes' table.
        // For simple setup, we return all classes in tenant or filter if we had that link.
        // Assuming RLS handles tenant filtering:
        const { data: classes, error } = await supabase
            .from('classes')
            .select('id, name')
            .order('name')

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data: classes }
    } catch (error) {
        console.error('Error fetching teacher classes:', error)
        return { success: false, error: 'Failed to fetch classes' }
    }
}

/**
 * Get all students in a class (for initial roster)
 */
export async function getClassStudents(classId: string): Promise<{ success: boolean; data?: { id: string; full_name: string; photo_url?: string }[]; error?: string }> {
    const supabase = createClient()

    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('id, full_name, photo_url')
            .eq('class_id', classId)
            .order('full_name')

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data: students }
    } catch (error) {
        console.error('Error fetching class students:', error)
        return { success: false, error: 'Failed to fetch students' }
    }
}
