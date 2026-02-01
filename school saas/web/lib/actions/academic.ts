"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateGlobalSession(domain: string, sessionData: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get Tenant
    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { success: false, error: "Admin access required" }

    // 1. Deactivate all other sessions
    if (sessionData.is_active) {
        await supabase
            .from('academic_sessions')
            .update({ is_active: false })
            .eq('tenant_id', profile.tenant_id)
            .neq('id', '00000000-0000-0000-0000-000000000000') // Safety check
    }

    // 2. Upsert Session
    const { error } = await supabase
        .from('academic_sessions')
        .upsert({
            tenant_id: profile.tenant_id,
            ...sessionData
        })

    if (error) return { success: false, error: error.message }

    revalidatePath(`/${domain}/dashboard/admin/setup`)
    return { success: true }
}

export async function saveGradeScales(scales: any[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { success: false, error: "Admin access required" }

    // Enrich with tenant_id
    const data = scales.map(s => ({ ...s, tenant_id: profile.tenant_id }))

    const { error } = await supabase
        .from('grade_scales')
        .upsert(data)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function loadWAECStandards(domain: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    const waecScales = [
        { grade: 'A1', min_score: 75, max_score: 100, remark: 'Excellent' },
        { grade: 'B2', min_score: 70, max_score: 74, remark: 'Very Good' },
        { grade: 'B3', min_score: 65, max_score: 69, remark: 'Good' },
        { grade: 'C4', min_score: 60, max_score: 64, remark: 'Credit' },
        { grade: 'C5', min_score: 55, max_score: 59, remark: 'Credit' },
        { grade: 'C6', min_score: 50, max_score: 54, remark: 'Credit' },
        { grade: 'D7', min_score: 45, max_score: 49, remark: 'Pass' },
        { grade: 'E8', min_score: 40, max_score: 44, remark: 'Pass' },
        { grade: 'F9', min_score: 0, max_score: 39, remark: 'Fail' },
    ]

    const data = waecScales.map(s => ({ ...s, tenant_id: profile?.tenant_id }))

    // Delete existing to avoid conflicts/dupes logic if needed, but upsert is safer with IDs, here we just insert new if ID missing
    // Ideally we should wipe and replace or smart update. For simplicity, we delete all for this tenant and re-insert.
    await supabase.from('grade_scales').delete().eq('tenant_id', profile?.tenant_id)

    const { error } = await supabase.from('grade_scales').insert(data)

    if (error) return { success: false, error: error.message }
    revalidatePath(`/${domain}/dashboard/admin/setup`)
    return { success: true }
}

export async function updateSubjectMapping(subjectId: string, classIds: string[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    // 1. Delete existing for this subject
    await supabase.from('class_subjects').delete().eq('subject_id', subjectId).eq('tenant_id', profile?.tenant_id)

    // 2. Insert new
    if (classIds.length > 0) {
        const rows = classIds.map(cid => ({
            tenant_id: profile?.tenant_id,
            subject_id: subjectId,
            class_id: cid
        }))
        const { error } = await supabase.from('class_subjects').insert(rows)
        if (error) return { success: false, error: error.message }
    }

    return { success: true }
}

export async function bulkAddNigerianSubjects(domain: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    const subjects = [
        "Mathematics", "English Language", "Civic Education", "Biology", "Physics",
        "Chemistry", "Economics", "Government", "Literature-in-English", "CRS",
        "IRS", "Yoruba", "Igbo", "Hausa", "Data Processing", "Further Mathematics",
        "Agricultural Science", "Geography", "Commerce", "Financial Accounting"
    ]

    // Upsert by name logic constraint would be nice, but simple logic:
    // Check existing names to avoid dupes
    const { data: existing } = await supabase.from('subjects').select('name').eq('tenant_id', profile?.tenant_id)
    const existingNames = new Set(existing?.map(e => e.name))

    const newSubjects = subjects
        .filter(s => !existingNames.has(s))
        .map(s => ({ tenant_id: profile?.tenant_id, name: s, code: s.substring(0, 3).toUpperCase() }))

    if (newSubjects.length > 0) {
        const { error } = await supabase.from('subjects').insert(newSubjects)
        if (error) return { success: false, error: error.message }
    }

    revalidatePath(`/${domain}/dashboard/admin/setup`)
    return { success: true }
}

export async function getClassGrades(classId: string, subjectId: string, term: string, session: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('student_grades')
        .select('*')
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .eq('term', term)
        .eq('session', session)

    if (error) {
        console.error('Error fetching grades:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data }
}

export async function upsertGrade(gradeData: {
    studentId: string,
    subjectId: string,
    classId: string,
    term: string,
    session: string,
    ca1: number,
    ca2: number,
    exam: number
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const total = (gradeData.ca1 || 0) + (gradeData.ca2 || 0) + (gradeData.exam || 0)
    const grade = getGradeLetter(total)

    const { error } = await supabase
        .from('student_grades')
        .upsert({
            tenant_id: profile.tenant_id,
            student_id: gradeData.studentId,
            subject_id: gradeData.subjectId,
            class_id: gradeData.classId,
            term: gradeData.term,
            session: gradeData.session,
            ca1: gradeData.ca1,
            ca2: gradeData.ca2,
            exam: gradeData.exam,
            total: total,
            grade: grade,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'student_id,subject_id,term,session'
        })

    if (error) {
        console.error('Error upserting grade:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function calculateSubjectPositions(classId: string, subjectId: string, term: string, session: string) {
    const supabase = createClient()

    // 1. Fetch all grades for this class/subject/term/session
    const { data: grades, error } = await supabase
        .from('student_grades')
        .select('id, total')
        .eq('class_id', classId)
        .eq('subject_id', subjectId)
        .eq('term', term)
        .eq('session', session)
        .order('total', { ascending: false })

    if (error) return { success: false, error: error.message }
    if (!grades || grades.length === 0) return { success: true }

    // 2. Assign positions (handling ties)
    const updates = []
    let currentPos = 0
    let lastTotal = -1
    let skip = 0

    for (let i = 0; i < grades.length; i++) {
        if (grades[i].total !== lastTotal) {
            currentPos += 1 + skip
            skip = 0
        } else {
            skip++
        }
        lastTotal = grades[i].total

        updates.push({
            id: grades[i].id,
            position: currentPos
        })
    }

    // 3. Bulk update positions
    // Note: In Supabase, bulk update with different values usually requires multiple calls 
    // or a specialized RPC. For MVP simplicity, we'll loop or use upsert if ID is provided.
    for (const update of updates) {
        await supabase
            .from('student_grades')
            .update({ position: update.position })
            .eq('id', update.id)
    }

    return { success: true }
}

function getGradeLetter(score: number) {
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
