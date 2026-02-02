'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Types ---
export type BehavioralRating = {
    student_id: string;
    punctuality: number;
    neatness: number;
    politeness: number;
    cooperation: number;
    leadership: number;
    attentiveness: number;
    honesty?: number;
    peer_relations?: number;
    remark?: string;
}

// --- Actions ---

export async function awardBadge(studentId: string, badge: { title: string, icon_key: string, category: string, comment: string }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Get current tenant from user profile (assuming simple flow)
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const { error } = await supabase.from('achievements').insert({
        tenant_id: profile.tenant_id,
        student_id: studentId,
        awarded_by: user.id,
        title: badge.title,
        icon_key: badge.icon_key,
        category: badge.category,
        comment: badge.comment,
        awarded_at: new Date().toISOString()
    })

    if (error) {
        console.error("Error awarding badge:", error)
        return { success: false, error: "Failed to award badge" }
    }

    // TODO: Trigger Notification to Parent (Stub)
    console.log(`[NOTIFICATION] Badge '${badge.title}' awarded to student ${studentId}. Notify Parent.`)

    revalidatePath('/dashboard/student/profile')
    return { success: true }
}

export async function saveBehavioralRatings(classId: string, term: string, session: string, ratings: BehavioralRating[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    const upsertData = ratings.map(r => ({
        tenant_id: profile?.tenant_id,
        student_id: r.student_id,
        class_id: classId,
        term,
        session,
        punctuality: r.punctuality,
        neatness: r.neatness,
        politeness: r.politeness,
        cooperation: r.cooperation,
        leadership: r.leadership,
        attentiveness: r.attentiveness,
        honesty: r.honesty,
        peer_relations: r.peer_relations,
        overall_remark: r.remark, // Added mapping
        recorded_by: user.id,
        updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
        .from('behavioral_reports')
        .upsert(upsertData, { onConflict: 'student_id, term, session' })

    if (error) {
        console.error("Error saving ratings:", error)
        return { success: false, error: "Failed to save ratings" }
    }

    return { success: true }
}

export async function logIncident(studentId: string, incident: { title: string, description: string, type: 'positive' | 'disciplinary' | 'neutral' }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    const { error } = await supabase.from('incident_logs').insert({
        tenant_id: profile?.tenant_id,
        student_id: studentId,
        recorded_by: user.id,
        title: incident.title,
        description: incident.description,
        type: incident.type,
        occurred_at: new Date().toISOString()
    })

    if (error) {
        return { success: false, error: "Failed to log incident" }
    }

    revalidatePath('/dashboard/student/profile')
    return { success: true }
}

export async function generateBehavioralRemark(rating: BehavioralRating, studentName: string) {
    // Stub for AI generation
    // Real impl would call Google Gemini with the scores

    const highs = []
    if (rating.punctuality >= 4) highs.push("punctual")
    if (rating.neatness >= 4) highs.push("neat")
    if (rating.politeness >= 4) highs.push("polite")

    const lows = []
    if (rating.cooperation <= 2) lows.push("cooperation")
    if (rating.attentiveness <= 2) lows.push("focus")

    let remark = `${studentName} is a generally good student.`
    if (highs.length > 0) {
        remark = `${studentName} is an exponentially ${highs.join(', ')} student.`
    }
    if (lows.length > 0) {
        remark += ` However, they need to improve on ${lows.join(' and ')}.`
    }

    // Artificial delay to simulate AI
    await new Promise(resolve => setTimeout(resolve, 800))

    return { success: true, remark }
}
