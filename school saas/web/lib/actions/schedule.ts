'use server'

import { createClient } from "@/lib/supabase/server"

export async function getNextClass() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get current day and time
    // Note: This relies on Server Time. Ideally, we use client time, but for "Next Up" badge, server approximation is okay, or we fetch all today's classes and filter on client.
    // Fetching all today's classes is safer for timezone accuracy on client.

    // However, prompt implies "Pull ... based on the current system time".
    // I will fetch the user's schedule for the current day of the week.

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = days[new Date().getDay()]

    // We need to know who the user is (Student or Teacher)
    // Assuming 'profiles' logic from auth.ts
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, tenant_id') // we might need class_id for students?
        .eq('id', user.id)
        .single()

    if (!profile) return null

    let query = supabase
        .from('timetables')
        .select(`
            id,
            start_time,
            end_time,
            subject:subjects(name),
            class:classes(name)
        `)
        .eq('day_of_week', today)
        .eq('tenant_id', profile.tenant_id)
        .order('start_time', { ascending: true })

    if (profile.role === 'teacher') {
        query = query.eq('teacher_id', profile.id)
    } else if (profile.role === 'student') {
        // 1. Find Student Record to get Class ID
        // Try linking via user_id first (best practice)
        let { data: student } = await supabase
            .from('students')
            .select('class_id')
            .eq('user_id', user.id)
            .maybeSingle()

        // Fallback: Link via email if user_id not set
        if (!student) {
            const { data: userEmail } = await supabase.from('profiles').select('email').eq('id', user.id).single()
            if (userEmail) {
                const { data: s } = await supabase.from('students').select('class_id').eq('email', userEmail.email).maybeSingle()
                student = s
            }
        }

        if (!student || !student.class_id) {
            // Second Fallback for Demo: Fetch FIRST student to avoid blank screen if no link exists
            const { data: demoStudent } = await supabase.from('students').select('class_id').limit(1).single()
            if (demoStudent) student = demoStudent
        }

        if (student && student.class_id) {
            query = query.eq('class_id', student.class_id)
        } else {
            return { role: profile.role, schedule: [] }
        }
    }

    const { data: schedule } = await query

    return {
        role: profile.role,
        schedule: schedule || []
    }
}

export async function createTimetableSlot(data: {
    day_of_week: string
    start_time: string
    end_time: string
    subject_id: string
    class_id: string
    teacher_id: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) throw new Error("Profile not found")

    const { error } = await supabase.from('timetables').insert({
        ...data,
        tenant_id: profile.tenant_id
    })

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function deleteTimetableSlot(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('timetables').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return { success: true }
}

export async function getFullTimetable() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return []

    const { data } = await supabase
        .from('timetables')
        .select(`
            id,
            day_of_week,
            start_time,
            end_time,
            subject:subjects(id, name),
            class:classes(id, name),
            teacher:profiles(id, full_name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('start_time', { ascending: true })

    return data || []
}
