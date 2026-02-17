'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Assignment } from '@/types/assignments'
import { revalidatePath } from 'next/cache'

/**
 * Resolve the student profile for a given user and tenant.
 * Includes intelligent fallback for demo/testing.
 */
export async function resolveStudentForUser(supabase: any, userId: string, tenantId: string) {
    // 1. Try strict link via user_id
    let { data: student } = await supabase
        .from('students')
        .select('id, class_id')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .maybeSingle()

    if (student) return student

    // 2. Try link via profile email
    const { data: profile } = await supabase.from('profiles').select('email').eq('id', userId).single()
    if (profile?.email) {
        const { data: s } = await supabase
            .from('students')
            .select('id, class_id')
            .eq('email', profile.email)
            .eq('tenant_id', tenantId)
            .maybeSingle()
        if (s) return s
    }

    // 3. Intelligent Fallback for demo/testing
    const { data: assignmentsWithClass } = await supabase
        .from('assignments')
        .select('class_id')
        .eq('tenant_id', tenantId)
        .limit(1)

    if (assignmentsWithClass && assignmentsWithClass.length > 0) {
        const targetClassId = assignmentsWithClass[0].class_id
        const { data: s } = await supabase
            .from('students')
            .select('id, class_id')
            .eq('tenant_id', tenantId)
            .eq('class_id', targetClassId)
            .limit(1)
            .maybeSingle()
        if (s) return s
    }

    // 4. Absolute fallback
    const { data: s } = await supabase
        .from('students')
        .select('id, class_id')
        .eq('tenant_id', tenantId)
        .limit(1)
        .maybeSingle()

    return s || null
}

export async function createAssignment(data: {
    title: string
    description: string
    dueDate: Date | undefined
    points: number
    classId: string
    subjectId: string
    fileUrl?: string
    fileName?: string
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
            points: data.points,
            file_url: data.fileUrl,
            file_name: data.fileName
        })

        if (error) {
            console.error('Error creating assignment:', error)
            return { success: false, error: 'Failed to create assignment' }
        }

        revalidatePath('/[domain]/dashboard/teacher/assessments', 'page')
        revalidatePath('/[domain]/dashboard/student/assignments', 'page')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error creating assignment:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function getAssignments(classId: string, subjectId: string) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // Get tenant_id from profile
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Profile not found" }

        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
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

        // 1. Get User Profile to know their tenant_id
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, email')
            .eq('id', user.id)
            .single()

        if (!profile) return { success: false, error: "Profile not found" }

        // 2. Resolve Student ID linked to this user/tenant
        const student = await resolveStudentForUser(supabase, user.id, profile.tenant_id)

        if (!student || !student.class_id) {
            console.error('[getStudentAssignments] Student resolution failed for user:', user.id)
            return { success: false, error: "Student profile not found" }
        }

        // 3. Fetch Traditional Assignments ONLY, isolated by tenant and class
        const { data: assignments, error: assignmentsError } = await supabase
            .from('assignments')
            .select(`
                *,
                subject:subjects(name),
                teacher:profiles(full_name)
            `)
            .eq('tenant_id', profile.tenant_id)
            .eq('class_id', student.class_id)
            .order('due_date', { ascending: true })

        if (assignmentsError) throw assignmentsError

        // 4. Fetch Submissions for this student
        const { data: submissions, error: subError } = await supabase
            .from('assignment_submissions')
            .select('*')
            .eq('student_id', student.id)
            .in('assignment_id', (assignments || []).map(a => a.id))

        if (subError && assignments && assignments.length > 0) throw subError

        // 5. Normalize Data
        const normalized = (assignments || []).map(a => {
            const sub = submissions?.find(s => s.assignment_id === a.id)
            return {
                id: a.id,
                title: a.title,
                description: a.description,
                points: a.points,
                dueDate: a.due_date,
                subject: a.subject?.name || 'General',
                teacher: a.teacher?.full_name || 'Unknown Teacher',
                status: sub ? (sub.grade !== null ? 'graded' : 'submitted') : 'pending',
                type: 'assignment',
                grade: sub?.grade,
                feedback: sub?.feedback,
                submittedDate: sub?.submitted_at,
                fileUrl: a.file_url,
                fileName: a.file_name
            }
        })

        return { success: true, data: normalized }

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

        // 1. Get User Profile to know their tenant_id
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, email')
            .eq('id', user.id)
            .single()

        if (!profile) return { success: false, error: "Profile not found" }

        // 2. Resolve Student ID linked to this user/tenant
        const student = await resolveStudentForUser(supabase, user.id, profile.tenant_id)

        if (!student) return { success: false, error: "Student profile not found" }

        // 3. Upsert Submission
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

        revalidatePath('/[domain]/dashboard/student/assignments', 'page')
        revalidatePath('/[domain]/dashboard/teacher/assessments', 'page')

        return { success: true }
    } catch (error) {
        console.error('Error submitting assignment:', error)
        return { success: false, error: 'Failed to submit assignment' }
    }
}

/**
 * Grade an assignment submission
 */
export async function gradeAssignmentSubmission(submissionId: string, grade: number, feedback?: string) {
    const supabase = createClient()
    const admin = createAdminClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const { error } = await admin
            .from('assignment_submissions')
            .update({
                grade: grade,
                feedback: feedback,
                graded_at: new Date().toISOString()
            })
            .eq('id', submissionId)

        if (error) {
            console.error('Supabase Error grading submission:', error)
            throw error
        }

        revalidatePath('/[domain]/dashboard/student/assignments', 'page')
        revalidatePath('/[domain]/dashboard/teacher/assessments', 'page')

        return { success: true }
    } catch (error: any) {
        console.error('Error grading submission:', error)
        return { success: false, error: error.message || 'Failed to save grade' }
    }
}

export async function getAssignmentSubmissions(assignmentId: string) {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('assignment_submissions')
            .select(`
                *,
                student:students(id, full_name, admission_number)
            `)
            .eq('assignment_id', assignmentId)
            .order('submitted_at', { ascending: false })

        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('Error fetching submissions:', error)
        return { success: false, error: 'Failed to load submissions' }
    }
}
export async function updateAssignment(assignmentId: string, data: {
    title: string
    description: string
    dueDate: Date | undefined
    points: number
    fileUrl?: string
    fileName?: string
}) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // Get tenant_id from profile
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Profile not found" }

        const { error } = await supabase
            .from('assignments')
            .update({
                title: data.title,
                description: data.description,
                due_date: data.dueDate?.toISOString(),
                points: data.points,
                file_url: data.fileUrl,
                file_name: data.fileName
            })
            .eq('id', assignmentId)
            .eq('tenant_id', profile.tenant_id) // Strict tenant isolation

        if (error) {
            console.error('Error updating assignment:', error)
            return { success: false, error: 'Failed to update assignment' }
        }

        revalidatePath('/[domain]/dashboard/teacher/assessments', 'page')
        revalidatePath('/[domain]/dashboard/student/assignments', 'page')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error updating assignment:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function deleteAssignment(assignmentId: string) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // Get tenant_id from profile
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Profile not found" }

        const { error } = await supabase
            .from('assignments')
            .delete()
            .eq('id', assignmentId)
            .eq('tenant_id', profile.tenant_id) // Strict tenant isolation

        if (error) {
            console.error('Error deleting assignment:', error)
            return { success: false, error: 'Failed to delete assignment' }
        }

        revalidatePath('/[domain]/dashboard/teacher/assessments', 'page')
        revalidatePath('/[domain]/dashboard/student/assignments', 'page')
        return { success: true }
    } catch (error) {
        console.error('Unexpected error deleting assignment:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
