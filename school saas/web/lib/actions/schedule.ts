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
    } else if (profile.role === 'student' || profile.role === 'parent') {
        // Students need their class_id.
        const { data: student } = await supabase
            .from('students')
            .select('class_id')
            .eq('parent_id', profile.id) // Assuming parent/student mapping for now. If user is student directly, eq('id', ...). 
        // In schema, 'students' table has 'parent_id'. If logged in user is the 'student', we need a way to link auth.users to students table directly?
        // Schema: profiles(id) references auth.users. role='student'.
        // STUDENTS table: id, tenant_id, full_name, parent_id, class_id.
        // There is no direct link from PROFILE to STUDENT table in the schema I viewed?
        // Wait, usually Profile IS the user.
        // If role is Student, Profile should maybe have class_id?
        // Schema.sql line 21 role in student.
        // I'll assume for this feature, I only implement for TEACHERS as requested in "Platinum Move: Teachers lose track of time".
        return { role: profile.role, schedule: [] }
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
