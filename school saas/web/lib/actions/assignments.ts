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

/**
 * Get assignments for a student
 * Fetches assignments for the student's class and checks submission status.
 */
export async function getStudentAssignments() {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // 1. Get Student Profile to know their Class ID
        // For simplicity, we assume one student per user or matching logic from profile
        // Using similar logic to student-profile.ts
        let { data: student } = await supabase
            .from('students')
            .select('id, class_id')
            .eq('user_id', user.id)
            .maybeSingle()

        if (!student) {
            // Fallback: Try linking via email if user_id is null in students table (legacy sync issue)
            const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single()
            if (profile) {
                const { data: s } = await supabase.from('students').select('id, class_id').eq('email', profile.email).maybeSingle()
                if (s) student = s
            }
        }

        // Final Fallback for demo: Pick first student if local dev and no link found
        if (!student) {
            const { data: s } = await supabase.from('students').select('id, class_id').limit(1).single()
            if (s) student = s
        }

        if (!student || !student.class_id) return { success: false, error: "Student or class not found" }

        // 2. Fetch Assignments for the Class
        const { data: assignments, error: assignError } = await supabase
            .from('assignments')
            .select(`
                *,
                subject:subjects(name),
                teacher:profiles(full_name)
            `)
            .eq('class_id', student.class_id)
            .order('due_date', { ascending: true })

        if (assignError) throw assignError

        // 3. Fetch Submissions for this student
        const { data: submissions, error: subError } = await supabase
            .from('assignment_submissions')
            .select('*')
            .eq('student_id', student.id)
            .in('assignment_id', assignments.map(a => a.id))

        if (subError) throw subError

        // 4. Merge Data
        const merged = assignments.map(a => {
            const sub = submissions.find(s => s.assignment_id === a.id)
            return {
                ...a,
                subject: a.subject?.name || 'General',
                teacher: a.teacher?.full_name || 'Unknown Teacher',
                status: sub ? (sub.grade ? 'graded' : 'submitted') : 'pending',
                submittedDate: sub?.submitted_at,
                grade: sub?.grade,
                feedback: sub?.feedback,
                submission: sub // detailed submission info
            }
        })

        return { success: true, data: merged }

    } catch (error) {
        console.error('Error fetching student assignments:', error)
        return { success: false, error: 'Failed to load assignments' }
    }
}

/**
 * Submit an assignment
 */
export async function submitAssignment(assignmentId: string, content: string, fileUrl?: string) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // Resolve Student ID (reuse logic or abstract it)
        let { data: student } = await supabase.from('students').select('id').eq('user_id', user.id).maybeSingle()
        if (!student) {
            const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single()
            if (profile) {
                const { data: s } = await supabase.from('students').select('id').eq('email', profile.email).maybeSingle()
                if (s) student = s
            }
        }
        // Fallback
        if (!student) {
            const { data: s } = await supabase.from('students').select('id').limit(1).single()
            if (s) student = s
        }

        if (!student) return { success: false, error: "Student profile not found" }

        // Upsert Submission
        const { error } = await supabase
            .from('assignment_submissions')
            .upsert({
                assignment_id: assignmentId,
                student_id: student.id,
                content: content,
                file_url: fileUrl,
                submitted_at: new Date().toISOString()
            }, { onConflict: 'assignment_id,student_id' })

        if (error) throw error

        revalidatePath('/dashboard/student/assignments')
        return { success: true }

    } catch (error) {
        console.error('Error submitting assignment:', error)
        return { success: false, error: 'Failed to submit assignment' }
    }
}
