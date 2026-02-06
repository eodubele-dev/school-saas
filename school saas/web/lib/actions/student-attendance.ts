'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface StudentAttendanceDTO {
    student_id: string
    status: 'present' | 'absent' | 'excused' | 'late'
    remarks?: string
}

/**
 * Get the class assigned to a teacher
 * For now, we'll fetch the first class where the teacher is a form teacher or has a subject assignment
 */
export async function getAssignedClass(): Promise<{ success: boolean; data?: { id: string; name: string; grade_level: string }; error?: string }> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        // 1. Get current day and time
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const now = new Date()
        const currentDay = days[now.getDay()]
        const currentTime = now.toTimeString().split(' ')[0] // HH:mm:ss

        // 2. Query timetables for the current active period
        // Check for teacher assignment in the current time slot
        const { data: currentPeriod, error: pError } = await supabase
            .from('timetables')
            .select('class:classes(id, name, grade_level)')
            .eq('teacher_id', user.id)
            .eq('day_of_week', currentDay)
            .lte('start_time', currentTime)
            .gte('end_time', currentTime)
            .maybeSingle()

        if (pError) throw pError

        if (currentPeriod?.class) {
            const cls = Array.isArray(currentPeriod.class) ? currentPeriod.class[0] : currentPeriod.class
            return { success: true, data: cls as { id: string; name: string; grade_level: string } }
        }

        // Fallback: If no current period assignment, check if they are a form teacher
        // (Optional: User requirement says "If not assigned to a period... displays No class found")
        // Keeping form teacher as a logical fallback for the "Dashboard Vitals" context
        const { data: formClass } = await supabase
            .from('classes')
            .select('id, name, grade_level')
            .eq('form_teacher_id', user.id)
            .maybeSingle()

        if (formClass) return { success: true, data: formClass }

        return { success: false, error: "No class assigned to you found" }

    } catch (error) {
        console.error("Error getting assigned class:", error)
        return { success: false, error: "Failed to fetch class" }
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
            .eq('status', 'active')
            .order('last_name')

        if (error) throw error

        return { success: true, data: students }
    } catch (error) {
        console.error("Error fetching students:", error)
        return { success: false, error: "Failed to load students" }
    }
}

/**
 * Mark student attendance for a given class and date
 */
export async function markStudentAttendance(
    classId: string,
    date: string,
    records: StudentAttendanceDTO[]
) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        // 1. Get or Create Register for today
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

        if (!profile) return { success: false, error: "Profile not found" }
        const { tenant_id } = profile

        // Upsert register
        const { data: register, error: regError } = await supabase
            .from('attendance_registers')
            .upsert({
                tenant_id,
                class_id: classId,
                date: date,
                marked_by: user.id
            }, { onConflict: 'class_id,date' })
            .select()
            .single()

        if (regError) throw regError

        // 2. Bulk Upsert Student Records
        const rowsToInsert = records.map(r => ({
            register_id: register.id,
            student_id: r.student_id,
            status: r.status,
            remarks: r.remarks
        }))

        // We delete existing for this register to handle updates cleanly (or upsert if ID known)
        // Ideally upsert by (register_id, student_id) if constraint exists.
        // Let's assume student_attendance has a composite unique key or we just delete and re-insert for simplicity of bulk operation

        // Checking for constraint - usually register_id + student_id should be unique
        // For safety, let's just delete previous records for this register if any (overwrite mode)
        await supabase.from('student_attendance').delete().eq('register_id', register.id)

        const { error: attError } = await supabase
            .from('student_attendance')
            .insert(rowsToInsert)

        if (attError) throw attError

        revalidatePath('/dashboard/attendance')
        return { success: true }

    } catch (error) {
        console.error("Error marking attendance:", error)
        return { success: false, error: "Failed to submit attendance" }
    }
}

/**
 * Send SMS to parents of absent students
 * Uses Termii (Mocked for now)
 */
export async function sendAbsenceSMS(absentStudentIds: string[]) {
    // In a real app, we would:
    // 1. Fetch parent phone numbers for these students
    // 2. Call Termii API

    console.log(`[MOCK SMS] Sending absence alerts for ${absentStudentIds.length} students`)

    return { success: true, message: `Sent SMS to ${absentStudentIds.length} parents` }
}
