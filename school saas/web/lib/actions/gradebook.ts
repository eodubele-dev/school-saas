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

        // 5. Forensic Logging: Track the change
        const { data: oldGrade } = await supabase
            .from('student_grades')
            .select('ca1, ca2, exam, total, remarks')
            .eq('student_id', entry.student_id)
            .eq('subject_id', entry.subject_id)
            .eq('term', entry.term)
            .eq('session', entry.session)
            .maybeSingle()

        // If ID exists, update. If not, insert (upsert based on unique constraint)
        const { data, error } = await supabase
            .from('student_grades')
            .upsert(payload, { onConflict: 'student_id, subject_id, term, session' })
            .select()
            .single()

        if (error) throw error

        // Insert Audit Log
        if (data) {
            await supabase.from('system_audit_logs').insert({
                tenant_id: profile?.tenant_id,
                actor_id: user.id,
                entity_type: 'gradebook',
                entity_id: data.id,
                action: 'SCORE_CHANGE',
                old_value: oldGrade || {},
                new_value: { ca1: data.ca1, ca2: data.ca2, exam: data.exam, total: data.total, remarks: data.remarks },
                metadata: { student_name: entry.student_name, field_updated: entry.ca1 !== undefined ? 'ca1' : entry.ca2 !== undefined ? 'ca2' : entry.exam !== undefined ? 'exam' : 'remarks' }
            })
        }

        revalidatePath('/dashboard/teacher/gradebook')
        return { success: true, data }

    } catch (error) {
        console.error("Upsert grade error:", error)
        return { success: false, error: "Failed to save grade" }
    }
}

import { model } from '@/lib/gemini'

/**
 * 3. Generate Remark (Gemini AI)
 */
export async function generateRemarkAI(studentName: string, scores: { ca1: number, ca2: number, exam: number, total: number }) {
    try {
        const { total, ca1, ca2, exam } = scores

        const prompt = `
            Act as a Senior Principal of a prestigious school.
            Generate a formal, constructive report card remark for ${studentName}.
            
            Context:
            - CA 1: ${ca1}/20
            - CA 2: ${ca2}/20
            - Exam: ${exam}/60
            - Total Score: ${total}/100
            
            Rules:
            1. Use British English.
            2. High scores (>80) should be highly commendatory.
            3. Average scores (40-60) should encourage improvement in specific areas.
            4. Failing scores (<40) should be firm but supportive, suggesting a meeting or extra focus.
            5. Keep it to 2-3 concise sentences. No slang.
            6. Do not use generic templates. Make it feel personalized to the score balance.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const remark = response.text().trim()

        return { success: true, remark }
    } catch (error) {
        console.error("AI Remark Error:", error)
        // Fallback to basic logic if AI fails
        const { total } = scores
        let performance = total >= 80 ? "outstanding" : total >= 60 ? "good" : total >= 40 ? "average" : "challenging"
        const fallback = `${studentName} had a ${performance} term. Continued effort is encouraged for better results.`
        return { success: true, remark: fallback }
    }
}

/**
 * 4. Lock Grades
 */
export async function lockClassGrades(domain: string, classId: string, subjectId: string, term: string, session: string) {
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

    revalidatePath(`/${domain}/dashboard/teacher/assessments`)
    return { success: true }
}

/**
 * 5. Unlock Grades (Admin Only)
 */
export async function unlockClassGrades(domain: string, classId: string, subjectId: string, term: string, session: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user?.id).single()

    if (profile?.role !== 'admin') {
        return { success: false, error: "Unauthorized: Admin access required" }
    }

    const { error } = await supabase
        .from('student_grades')
        .update({ is_locked: false })
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .eq('term', term)
        .eq('session', session)
        .eq('tenant_id', profile?.tenant_id)

    if (error) return { success: false, error: "Failed to unlock" }

    revalidatePath(`/${domain}/dashboard/teacher/assessments`)
    return { success: true }
}
/**
 * 6. Reject Grades (Principal/Admin Only)
 */
export async function rejectClassGrades(domain: string, classId: string, subjectId: string, term: string, session: string, reason: string = "Correction required") {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user?.id).single()

    if (!['admin', 'owner', 'manager'].includes(profile?.role || '')) {
        return { success: false, error: "Unauthorized: Admin access required" }
    }

    // 1. Get first record to log
    const { data: target } = await supabase
        .from('student_grades')
        .select('id')
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .eq('term', term)
        .eq('session', session)
        .limit(1)
        .single()

    const { error } = await supabase
        .from('student_grades')
        .update({ is_locked: false })
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .eq('term', term)
        .eq('session', session)
        .eq('tenant_id', profile?.tenant_id)

    if (error) return { success: false, error: "Failed to reject" }

    // Log Rejection
    if (target) {
        await supabase.from('system_audit_logs').insert({
            tenant_id: profile?.tenant_id,
            actor_id: user?.id,
            entity_type: 'gradebook',
            entity_id: target.id,
            action: 'REJECT',
            new_value: { status: 'UNLOCKED', reason },
            metadata: { classId, subjectId, term, session }
        })
    }

    revalidatePath(`/${domain}/dashboard/teacher/assessments`)
    revalidatePath('/dashboard/admin/approvals')
    return { success: true }
}
