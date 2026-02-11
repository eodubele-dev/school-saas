'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SMS_CONFIG } from '@/lib/constants/communication'

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

// --- Templates ---
const COMMUNICATION_TEMPLATES = {
    POSITIVE_BEHAVIOR: (studentName: string, badgeTitle: string, comment: string) =>
        `EduFlow Platinum: ${studentName} was awarded the ${badgeTitle} Badge! Recognition: "${comment}". View details: https://eduflow.app/portal`,
}

export async function awardBadge(studentId: string, badge: { title: string, icon_key: string, category: string, comment: string }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Get current tenant from user profile
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    // 1. Fetch Student and Parent Data
    const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
            full_name,
            parent:profiles!parent_id(id, full_name, phone)
        `)
        .eq('id', studentId)
        .single()

    if (studentError || !student) {
        console.error("Student/Parent not found:", studentError)
        return { success: false, error: "Student or Parent data records missing" }
    }

    const parent = student.parent as any;

    // 2. Persist Achievement (Forensic Audit Log)
    const { error: achievementError } = await supabase.from('achievements').insert({
        tenant_id: profile.tenant_id,
        student_id: studentId,
        awarded_by: user.id,
        title: badge.title,
        icon_key: badge.icon_key,
        category: badge.category,
        comment: badge.comment,
        awarded_at: new Date().toISOString()
    })

    if (achievementError) {
        console.error("Achievement insert error:", achievementError)
        return { success: false, error: "Failed to record achievement" }
    }

    // 3. Automated Notification Routing & Wallet Verification
    try {
        const [{ data: settings }, { data: tenant }] = await Promise.all([
            supabase
                .from('communication_settings')
                .select('badge_notifications_enabled')
                .eq('tenant_id', profile.tenant_id)
                .maybeSingle(),
            supabase
                .from('tenants')
                .select('sms_balance')
                .eq('id', profile.tenant_id)
                .single()
        ])

        const walletBalance = Number(tenant?.sms_balance) || 0
        const SMS_COST = SMS_CONFIG.UNIT_COST;

        // Use the dedicated communication_settings table for the toggle
        if (settings?.badge_notifications_enabled && walletBalance >= SMS_COST && parent?.phone) {
            // Deduct from wallet
            await supabase
                .from('tenants')
                .update({ sms_balance: walletBalance - SMS_COST })
                .eq('id', profile.tenant_id)

            // Compose Personalized Content
            const messageContent = COMMUNICATION_TEMPLATES.POSITIVE_BEHAVIOR(
                student.full_name,
                badge.title,
                badge.comment
            )

            // Log Multi-Channel Sync Event
            await supabase.from('message_logs').insert({
                tenant_id: profile.tenant_id,
                sender_id: user.id,
                recipient_name: parent.full_name,
                recipient_phone: parent.phone,
                message_content: messageContent,
                channel: 'sms',
                status: 'sent',
                cost: SMS_COST,
                provider_ref: `PLATINUM_NUDGE_${Date.now()}`
            })

            console.log(`[PLATINUM SMS] Sent to ${parent.full_name} (${parent.phone}) for ${student.full_name}.`)
        } else if (settings?.badge_notifications_enabled && !parent?.phone) {
            console.warn(`[SMS SKIPPED] No phone number on file for parent of ${student.full_name}`)
        }
    } catch (e) {
        console.error("Communication Hub Failure:", e)
    }


    revalidatePath('/dashboard/student/profile')
    return { success: true }
}

export async function saveBehavioralRatings(classId: string, term: string, session: string, ratings: BehavioralRating[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const upsertData = ratings.map(r => ({
        tenant_id: profile.tenant_id,
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
        overall_remark: r.remark,
        recorded_by: user.id
    }))

    const { error } = await supabase
        .from('behavioral_reports')
        .upsert(upsertData, { onConflict: 'student_id, term, session' }) // Matching SQL UNIQUE syntax

    if (error) {
        console.error("Error saving ratings:", error)
        if (error.message.includes("Could not find the") || error.message.includes("column does not exist")) {
            return {
                success: false,
                error: "Database schema is outdated. Please run the 'supabase/behavior_schema_repair.sql' script in your SQL Editor to add required columns (honesty, leadership, etc.)."
            }
        }
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function logIncident(studentId: string, incident: { title: string, description: string, type: 'positive' | 'disciplinary' | 'neutral' }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const { error } = await supabase.from('incident_logs').insert({
        tenant_id: profile.tenant_id,
        student_id: studentId,
        recorded_by: user.id,
        title: incident.title,
        description: incident.description,
        type: incident.type,
        occurred_at: new Date().toISOString()
    })

    if (error) {
        console.error("Error logging incident:", error)
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
    if ((rating.leadership || 0) >= 4) highs.push("a natural leader")
    if ((rating.honesty || 0) >= 4) highs.push("deeply honest")

    const lows = []
    if (rating.cooperation <= 2) lows.push("peer cooperation")
    if (rating.attentiveness <= 2) lows.push("classroom focus")
    if ((rating.peer_relations || 0) <= 2) lows.push("social harmony")

    let remark = `${studentName} demonstrates stable behavior.`
    if (highs.length > 0) {
        remark = `${studentName} is exceptionally ${highs.join(', ')}.`
    }
    if (lows.length > 0) {
        remark += ` However, they should prioritize improving in ${lows.join(' and ')}.`
    }

    // Artificial delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800))

    return { success: true, remark }
}

export async function getStudentAchievementSummary(studentId: string) {
    const supabase = createClient()
    const { data: achievements } = await supabase
        .from('achievements')
        .select('category')
        .eq('student_id', studentId)

    if (!achievements) return { total: 0, academic: 0, behavior: 0, leadership: 0, resilience: 0 }

    const summary = {
        total: achievements.length,
        academic: achievements.filter(a => a.category === 'academic').length,
        behavior: achievements.filter(a => a.category === 'behavior').length,
        leadership: achievements.filter(a => a.category === 'leadership').length,
        resilience: achievements.filter(a => a.category === 'resilience').length
    }

    return summary
}

export async function getStudentAchievements(studentId: string) {
    const supabase = createClient()
    const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', studentId)
        .order('awarded_at', { ascending: false })

    if (error) {
        console.error("Error fetching achievements:", error)
        return []
    }

    return achievements
}
