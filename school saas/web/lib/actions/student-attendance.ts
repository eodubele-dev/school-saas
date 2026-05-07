'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendAbsentNotification } from './attendance'

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late'

export interface StudentAttendanceDTO {
    student_id: string
    status: AttendanceStatus
    remarks?: string
}

export async function getAssignedClass() {
    const supabaseAdmin = createAdminClient()
    try {
        const { data: { user } } = await createClient().auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        // 1. Check Form Teacher (Priority)
        const { data: formClass, error: formError } = await supabaseAdmin
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

        // 2. Check Subject Assignments (Current Term)
        const { data: subjectAssign, error: subError } = await supabaseAdmin
            .from('subject_assignments')
            .select('class_id, classes(id, name)')
            .eq('teacher_id', user.id)
            .limit(1)
            .maybeSingle()

        if (subjectAssign && subjectAssign.classes) {
            const cls = subjectAssign.classes as any
            return {
                success: true,
                data: {
                    id: subjectAssign.class_id,
                    name: Array.isArray(cls) ? cls[0]?.name : cls?.name
                }
            }
        }

        // 3. Fallback: Check any class where teacher might be assigned in teacher_allocations
        const { data: allocation, error } = await supabaseAdmin
            .from('teacher_allocations')
            .select('class_id, classes(id, name)')
            .eq('teacher_id', user.id)
            .limit(1)
            .maybeSingle()

        if (allocation && allocation.classes) {
            const cls = allocation.classes as any
            return {
                success: true,
                data: {
                    id: allocation.class_id,
                    name: Array.isArray(cls) ? cls[0]?.name : cls?.name
                }
            }
        }

        return { success: false, error: 'No class assigned' }
    } catch (error) {
        console.error('getAssignedClass error:', error)
        return { success: false, error: 'Failed to fetch assigned class' }
    }
}
}

/**
 * Get students in a specific class
 */
export async function getClassStudents(classId: string) {
    const supabaseAdmin = createAdminClient()
    try {
        const { data: students, error } = await supabaseAdmin
            .from('students')
            .select('id, full_name, admission_number, photo_url, status')
            .eq('class_id', classId)
            // Remove strict 'active' filter during setup to ensure all imported students appear
            .order('full_name')

        if (error) throw error

        if (!students || students.length === 0) {
            console.warn(`No students found for class ${classId}`);
            return { success: true, data: [] }
        }

        // Map to match expected DTO
        const mappedStudents = students.map((s: any) => {
            const names = (s.full_name || 'Student Name').split(' ')
            return {
                id: s.id,
                first_name: names[0] || 'Unknown',
                last_name: names.slice(1).join(' ') || 'Student',
                admission_number: s.admission_number || 'N/A',
                photo_url: s.photo_url,
                full_name: s.full_name || 'Unknown Student'
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

        // 2. Prepare Payload using columns confirmed in migrations
        const payload = records.map(record => {
            const isPresent = record.status === 'present'
            return {
                register_id: register.id,
                student_id: record.student_id,
                status: record.status,
                remarks: record.remarks,
                clock_in_time: isPresent ? new Date().toISOString() : null
            }
        })

        // 3. Upsert Student Records using the (register_id, student_id) unique key
        const { error } = await supabase
            .from('student_attendance')
            .upsert(payload, { onConflict: 'register_id,student_id' })
        if (error) {
            console.error('Error saving records:', error)
            throw error
        }

        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error('markStudentAttendance error:', error)
        return { success: false, error: 'Failed to save attendance' }
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

    try {
        // Map to DTO format
        const records: StudentAttendanceDTO[] = students.map(s => ({
            student_id: s.studentId,
            status: s.status
        }))

        // Use the existing markStudentAttendance which handles upsert and registration
        // For simplicity in this bulk call, we assume all students belong to the same class
        // as the first one or we'd need to group them. In practice, bulk save is per class.
        const classId = students[0]?.classId
        if (!classId) return { success: false, marked: 0, failed: students.length, errors: ['No class ID provided'] }

        const res = await markStudentAttendance(classId, date, records)
        
        if (res.success) {
            results.marked = students.length
        } else {
            results.success = false
            results.failed = students.length
            results.errors = [res.error || 'Unknown error']
        }

        return results
    } catch (error) {
        return { success: false, marked: 0, failed: students.length, errors: [String(error)] }
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
            .select(`
                status,
                remarks,
                attendance_registers!inner(date)
            `)
            .eq('student_id', user.id)
            .order('attendance_registers(date)', { ascending: false })
        if (error) throw error

        const mappedHistory = (history || []).map((r: any) => ({
            date: r.attendance_registers?.date || 'Unknown',
            status: r.status,
            notes: r.remarks
        }))

        const stats = {
            present: mappedHistory.filter(r => r.status === 'present').length || 0,
            late: mappedHistory.filter(r => r.status === 'late').length || 0,
            absent: mappedHistory.filter(r => r.status === 'absent').length || 0,
            excused: mappedHistory.filter(r => r.status === 'excused').length || 0,
            streak: 0 // Simplified
        }

        // Simple streak calculation (consecutive present days)
        if (mappedHistory.length > 0) {
            let streak = 0
            for (const record of mappedHistory) {
                if (record.status === 'present') streak++
                else break
            }
            stats.streak = streak
        }

        return { history: mappedHistory, stats }
    } catch (error) {
        console.error('getStudentAttendanceHistory error:', error)
        return { history: [], stats: null }
    }
}

export async function getClassAttendance(
    classId: string,
    date: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const supabaseAdmin = createAdminClient()

    try {
        // 1. Get Register ID for this class and date
        const { data: register } = await supabaseAdmin
            .from('attendance_registers')
            .select('id')
            .eq('class_id', classId)
            .eq('date', date)
            .maybeSingle()

        if (!register) {
            return { success: true, data: [] }
        }

        // 2. Get Attendance Records using Register ID
        const { data, error } = await supabaseAdmin
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

        revalidatePath('/', 'layout')
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
