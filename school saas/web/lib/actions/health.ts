"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getHealthDashboardData() {
    const supabase = createClient()

    // Fetch all students for the dropdowns
    const { data: students } = await supabase
        .from('students')
        .select('id, full_name, admission_number, photo_url')
        .order('full_name', { ascending: true })

    // Fetch recent medical incidents
    const { data: incidents } = await supabase
        .from('medical_incidents')
        .select(`
            *,
            student:students(full_name, admission_number)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

    // Fetch active allergy alerts
    const { data: alerts } = await supabase
        .from('student_health_alerts')
        .select(`
            *,
            student:students(full_name, admission_number)
        `)
        .order('created_at', { ascending: false })

    return {
        students: students || [],
        incidents: incidents || [],
        alerts: alerts || []
    }
}

export async function addMedicalIncident(data: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Get the nurse's profile name
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

    const nurseName = profile?.full_name || 'Staff Nurse'

    const { error } = await supabase
        .from('medical_incidents')
        .insert({
            student_id: data.studentId,
            incident_date: data.date,
            incident_time: data.time,
            type: data.type,
            title: data.title,
            treatment: data.treatment,
            status: data.status,
            nurse_name: nurseName
        })

    if (error) {
        console.error("Error adding medical incident:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/health', 'page')
    // We should also revalidate the parent platinum page, but since we use client components there, 
    // real-time subscriptions would be better, or we can just hope they refresh. 
    revalidatePath('/dashboard/platinum', 'page')

    return { success: true }
}

export async function addHealthAlert(data: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('student_health_alerts')
        .insert({
            student_id: data.studentId,
            condition: data.condition,
            severity: data.severity,
            notes: data.notes
        })

    if (error) {
        console.error("Error adding health alert:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/admin/health', 'page')
    revalidatePath('/dashboard/platinum', 'page')

    return { success: true }
}
