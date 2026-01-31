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
