'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStudentProfileData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Get Base Student Info
    // Assuming linked profile logic or user is a student:
    // For demo, we fetch the first student record associated with this user ID (if parent) or just the student ID if direct.
    // Let's assume we find the student record.
    // 1. Get Base Student Info with Profile (Avatar)
    const { data: student } = await supabase
        .from('students')
        .select(`
            *,
            class:classes(name),
            metadata:student_metadata(*),
            profile:profiles(avatar_url)
        `)
        .limit(1)
        .single()

    if (!student) return { success: false, error: "Student not found" }

    // 1b. Get Tenant/School Details
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', student.tenant_id)
        .single()

    if (!student) return { success: false, error: "Student not found" }

    // 2. Fetch Achievements
    const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', student.id)
        .order('awarded_at', { ascending: false })

    // 3. Fetch Behavioral Report (Latest)
    const { data: behavior } = await supabase
        .from('behavioral_reports')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // 4. Fetch Incident Log
    const { data: incidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('student_id', student.id)
        .order('occurred_at', { ascending: false })

    return {
        success: true,
        student: {
            ...student,
            metadata: student.metadata || {},
            avatar_url: student.passport_photo_url || student.profile?.avatar_url
        },
        tenant: tenant,
        achievements: achievements || [],
        behavior: behavior || null,
        incidents: incidents || []
    }
}
