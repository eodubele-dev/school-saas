"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// 🛡️ SECURITY ACTIONS
export async function getPickupAuthorization(studentId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('pickup_authorization')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching pickup auth:', error)
        return []
    }

    return data
}

export async function generateGatePass(studentId: string, type: 'early_dismissal' | 'late_pickup', reason: string, time: string) {
    const supabase = createClient()

    // In production, validate user permissions here

    const passCode = `GP-${Math.floor(100000 + Math.random() * 900000)}`

    // Parse time to actual timestamp (simplified for demo)
    const validUntil = new Date()
    validUntil.setHours(validUntil.getHours() + 1) // Valid for 1 hour by default

    const { data, error } = await supabase
        .from('gate_passes')
        .insert({
            student_id: studentId,
            type,
            reason,
            pass_code: passCode,
            valid_until: validUntil.toISOString(),
            status: 'active'
        })
        .select()
        .single()

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

// 🏥 HEALTH ACTIONS
export async function getMedicalLogs(studentId: string) {
    const supabase = createClient()

    const { data } = await supabase
        .from('medical_incidents')
        .select('*')
        .eq('student_id', studentId)
        .order('incident_date', { ascending: false })
        .limit(5)

    return data || []
}

export async function getHealthAlerts(studentId: string) {
    const supabase = createClient()

    const { data } = await supabase
        .from('student_health_alerts')
        .select('*')
        .eq('student_id', studentId)

    return data || []
}

// 🗣️ VOICE ACTIONS
export async function submitFeedback(category: string, rating: number, message: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: 'Unauthorized' }

    const { error } = await supabase
        .from('feedback_submissions')
        .insert({
            user_id: user.id,
            category,
            rating,
            message
        })

    if (error) return { success: false, message: error.message }
    return { success: true }
}

export async function bookPTASlot(studentId: string, date: string, time: string) {
    // keeping it simple for MVP
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false }

    const { error } = await supabase
        .from('pta_meetings')
        .insert({
            parent_id: user.id,
            student_id: studentId,
            scheduled_at: new Date().toISOString(), // placeholder logic
            status: 'scheduled'
        })

    if (error) return { success: false }
    revalidatePath('/dashboard')
    return { success: true }
}

export async function getPTASlots(teacherId: string) {
    // Mock slots for demonstration
    const baseDate = new Date();
    baseDate.setHours(9, 0, 0, 0);

    return [
        { id: '1', start_time: new Date(baseDate.setHours(9, 0)).toISOString(), is_available: true },
        { id: '2', start_time: new Date(baseDate.setHours(9, 30)).toISOString(), is_available: false },
        { id: '3', start_time: new Date(baseDate.setHours(10, 0)).toISOString(), is_available: true },
        { id: '4', start_time: new Date(baseDate.setHours(10, 30)).toISOString(), is_available: true },
        { id: '5', start_time: new Date(baseDate.setHours(11, 0)).toISOString(), is_available: false },
    ];
}

// 📚 LEARNING ACTIONS
export async function getAssignments(studentId: string) {
    const supabase = createClient()

    const { data } = await supabase
        .from('personal_assignments')
        .select('*')
        .eq('student_id', studentId)
        .order('due_date', { ascending: true })

    return data || []
}

export async function getCurriculumProgress(studentId: string) {
    const supabase = createClient()

    const { data } = await supabase
        .from('curriculum_milestones')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true })

    return data || []
}
