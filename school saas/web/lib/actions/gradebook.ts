'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface GradeEntry {
    id: string
    student_id: string
    student_name: string
    ca1: number
    ca2: number
    exam: number
    total: number
    grade: string
    remarks: string
    is_locked: boolean
    subject_id: string
    class_id: string
    term: string
    session: string
}

/**
 * 1. Fetch Class Grades
 * Gets or creates draft entries for all students in a class for a subject.
 */
export async function getClassGrades(classId: string, subjectId: string, term: string = '1st', session: string = '2023/2024') {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Profile not found" }

        // Fetch students in class
        const { data: students, error: studError } = await supabase
            .from('students')
            .select('id, full_name')
            .eq('class_id', classId)
            .eq('tenant_id', profile.tenant_id)
            .order('full_name')

        if (studError) throw studError

        // Fetch existing grades
        const { data: grades, error: gradeError } = await supabase
            .from('student_grades')
            .select('*')
            .eq('class_id', classId)
            .eq('subject_id', subjectId)
            .eq('term', term)
            .eq('session', session)
            .eq('tenant_id', profile.tenant_id)

        if (gradeError) throw gradeError

        // Merge: If grade doesn't exist for student, creates a "draft" object (not saved yet or empty saved DB record)
        // For optimisic UI, we return a list of rows. 
        // Real-world: Insert missing rows or handle on frontend.
        // Let's ensure referenced rows exist so upserts are easy.

        const combined = students.map(student => {
            const grade = grades.find(g => g.student_id === student.id)
            return {
                id: grade?.id, // undefined if new
                student_id: student.id,
                student_name: student.full_name,
                ca1: grade?.ca1 || 0,
                ca2: grade?.ca2 || 0,
                exam: grade?.exam || 0,
                total: grade?.total || 0,
                grade: grade?.grade || 'F',
                remarks: grade?.remarks || '',
                is_locked: grade?.is_locked || false,
                subject_id: subjectId,
                class_id: classId,
                term,
                session
            }
        })

        return { success: true, data: combined }

    } catch (error) {
        console.error("Fetch grades error:", error)
        return { success: false, error: "Failed to load grades" }
    }
}

/**
 * 2. Upsert Grade (Optimistic Save)
 * Handles single cell or row updates. 
 * Auto-calculates grade letter on server too for safety.
 */
export async function upsertGrade(entry: Partial<GradeEntry>) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

        // Server-side calc
        const total = (Number(entry.ca1) || 0) + (Number(entry.ca2) || 0) + (Number(entry.exam) || 0)
        let grade = 'F'
        if (total >= 70) grade = 'A'
        else if (total >= 60) grade = 'B'
        else if (total >= 50) grade = 'C'
        else if (total >= 45) grade = 'D'
        else if (total >= 40) grade = 'E'

        const payload: any = {
            student_id: entry.student_id,
            subject_id: entry.subject_id,
            class_id: entry.class_id,
            term: entry.term,
            session: entry.session,
            tenant_id: profile?.tenant_id,
            ca1: entry.ca1,
            ca2: entry.ca2,
            exam: entry.exam,
            total,
            grade,
            remarks: entry.remarks,
            updated_at: new Date()
        }

        // If ID exists, update. If not, insert (upsert based on unique constraint)
        const { data, error } = await supabase
            .from('student_grades')
            .upsert(payload, { onConflict: 'student_id, subject_id, term, session' })
            .select()
            .single()

        if (error) throw error

        revalidatePath('/dashboard/teacher/gradebook')
        return { success: true, data }

    } catch (error) {
        console.error("Upsert grade error:", error)
        return { success: false, error: "Failed to save grade" }
    }
}

/**
 * 3. Generate Remark (Gemini AI Stub)
 */
export async function generateRemarkAI(studentName: string, scores: { ca1: number, ca2: number, exam: number, total: number }) {
    // Stub for Gemini 1.5 Flash
    // In real app: call Google Generative AI SDK

    const { total } = scores
    let performance = ""
    if (total >= 80) performance = "an outstanding performance"
    else if (total >= 70) performance = "an excellent performance"
    else if (total >= 60) performance = "a good performance"
    else if (total >= 50) performance = "an average performance"
    else performance = "a below average performance"

    const remark = `Professional Remark for ${studentName}: ${studentName} demonstrated ${performance} this term. Keep up the consistent effort to maintain these standards.`

    return { success: true, remark }
}

/**
 * 4. Lock Grades
 */
export async function lockClassGrades(classId: string, subjectId: string, term: string, session: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    const { error } = await supabase
        .from('student_grades')
        .update({ is_locked: true })
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .eq('term', term)
        .eq('session', session)
        .eq('tenant_id', profile?.tenant_id)

    if (error) return { success: false, error: "Failed to lock" }

    revalidatePath('/dashboard/teacher/gradebook')
    return { success: true }
}
