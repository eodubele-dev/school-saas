'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface GradeEntry {
    studentId: string
    subjectId: string
    classId: string
    term: string
    session: string
    ca1?: number
    ca2?: number
    exam?: number
}

// WAEC Grading System
const getGrade = (score: number): string => {
    if (score >= 75) return 'A1'
    if (score >= 70) return 'B2'
    if (score >= 65) return 'B3'
    if (score >= 60) return 'C4'
    if (score >= 55) return 'C5'
    if (score >= 50) return 'C6'
    if (score >= 45) return 'D7'
    if (score >= 40) return 'E8'
    return 'F9'
}

/**
 * Upsert a student grade
 * Automatically calculates total and assigns grade
 */
export async function upsertGrade(entry: GradeEntry) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        // Get tenant ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile) return { success: false, error: 'Profile not found' }

        const ca1 = entry.ca1 || 0
        const ca2 = entry.ca2 || 0
        const exam = entry.exam || 0
        const total = ca1 + ca2 + exam
        const grade = getGrade(total)

        const { error } = await supabase
            .from('student_grades')
            .upsert({
                tenant_id: profile.tenant_id,
                student_id: entry.studentId,
                subject_id: entry.subjectId,
                class_id: entry.classId,
                term: entry.term,
                session: entry.session,
                ca1,
                ca2,
                exam,
                total,
                grade
            }, {
                onConflict: 'student_id,subject_id,term,session'
            })

        if (error) {
            console.error('Error upserting grade:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/academic/gradebook')
        return { success: true }

    } catch {
        console.error('Error in upsertGrade')
        return { success: false, error: 'Failed to save grade' }
    }
}

/**
 * Calculate positions for a class in a specific subject
 */
export async function calculateSubjectPositions(
    classId: string,
    subjectId: string,
    term: string,
    session: string
) {
    const supabase = createClient()

    try {
        // Fetch all grades for this subject/class sorted by total desc
        const { data: grades, error } = await supabase
            .from('student_grades')
            .select('id, total')
            .eq('class_id', classId)
            .eq('subject_id', subjectId)
            .eq('term', term)
            .eq('session', session)
            .order('total', { ascending: false })

        if (error) throw error

        // Update positions
        let currentPos = 1
        for (const grade of grades) {
            await supabase
                .from('student_grades')
                .update({ position: currentPos })
                .eq('id', grade.id)
            currentPos++
        }

        return { success: true }
    } catch {
        console.error("Error calculating positions")
        return { success: false, error: 'Failed to calculate positions' }
    }
}

/**
 * Fetch grades for a class sheet (all students, specific subject)
 */
export async function getClassGrades(
    classId: string,
    subjectId: string,
    term: string,
    session: string
) {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('student_grades')
            .select(`
                student_id,
                ca1,
                ca2,
                exam,
                total,
                grade,
                position
            `)
            .eq('class_id', classId)
            .eq('subject_id', subjectId)
            .eq('term', term)
            .eq('session', session)

        if (error) throw error

        return { success: true, data }
    } catch {
        return { success: false, error: 'Failed to fetch grades' }
    }
}

/**
 * Fetch all subjects for a tenant
 */
export async function getSubjects() {
    const supabase = createClient()
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('id, name, code')
            .order('name')

        if (error) throw error
        return { success: true, data }
    } catch {
        return { success: false, error: 'Failed to fetch subjects' }
    }
}
