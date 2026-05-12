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

        const classIds = new Set<string>()

        // 1. Collect all possible assigned IDs from all sources
        const [formClasses, subjectAssigns, allocations] = await Promise.all([
            supabaseAdmin.from('classes').select('id').eq('form_teacher_id', user.id),
            supabaseAdmin.from('subject_assignments').select('class_id').eq('teacher_id', user.id),
            supabaseAdmin.from('teacher_allocations').select('class_id').eq('teacher_id', user.id)
        ])

        formClasses.data?.forEach(c => classIds.add(c.id))
        subjectAssigns.data?.forEach(c => classIds.add(c.class_id))
        allocations.data?.forEach(c => classIds.add(c.class_id))

        if (classIds.size === 0) return { success: false, error: 'No class assigned' }

        // 2. Fetch class names and student counts to pick the best one
        const { data: classes } = await supabaseAdmin
            .from('classes')
            .select('id, name')
            .in('id', Array.from(classIds))

        if (!classes || classes.length === 0) return { success: false, error: 'No class assigned' }

        // Fetch student counts for these classes to prioritize the active one
        const { data: studentCounts } = await supabaseAdmin
            .from('students')
            .select('class_id')
            .in('class_id', classes.map(c => c.id))

        const countMap = studentCounts?.reduce((acc: Record<string, number>, s) => {
            acc[s.class_id] = (acc[s.class_id] || 0) + 1
            return acc
        }, {}) || {}

        // 3. Pick the class with the most students (prioritizing the real one over ghost ones)
        const sorted = classes.map(c => ({
            ...c,
            count: countMap[c.id] || 0
        })).sort((a, b) => b.count - a.count)

        const bestClass = sorted[0]

        return {
            success: true,
            data: { id: bestClass.id, name: bestClass.name }
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

        // 2. Get Attendance Records
        const { data: attendanceData, error: attError } = await supabaseAdmin
            .from('student_attendance')
            .select('*')
            .eq('register_id', register.id)

        if (attError) throw attError
        if (!attendanceData || attendanceData.length === 0) return { success: true, data: [] }

        // 3. Fetch Student Details in bulk (No joins)
        const studentIds = attendanceData.map(r => r.student_id)
        const { data: students, error: studentError } = await supabaseAdmin
            .from('students')
            .select('id, full_name, parent_id')
            .in('id', studentIds)

        if (studentError) throw studentError

        // 4. Fetch Parent/Profile Details if needed (for phone)
        const parentIds = students?.map(s => s.parent_id).filter(Boolean) as string[]
        const parentMap: Record<string, string> = {}
        if (parentIds.length > 0) {
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('id, phone')
                .in('id', parentIds)
            
            profiles?.forEach(p => {
                parentMap[p.id] = p.phone
            })
        }

        const studentMap = students?.reduce((acc: any, s) => {
            acc[s.id] = s
            return acc
        }, {})

        // 5. Map results
        const records = attendanceData.map(record => {
            const student = studentMap[record.student_id]
            return {
                id: record.id,
                student_id: record.student_id,
                student_name: student?.full_name || 'Unknown',
                class_id: classId,
                date: date,
                status: record.status,
                marked_by: null,
                marked_at: record.created_at,
                notes: record.remarks,
                sms_sent: record.sms_sent,
                parent_phone: student?.parent_id ? parentMap[student.parent_id] : null,
                clock_out_time: record.clock_out_time
            }
        })

        // Sort by name
        records.sort((a, b) => a.student_name.localeCompare(b.student_name))

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
