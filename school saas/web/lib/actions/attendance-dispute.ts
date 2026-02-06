"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface DisputeSubmission {
    auditLogId: string
    distanceDetected: number
    reason: string
    proofUrl?: string
}

export async function submitAttendanceDispute(data: DisputeSubmission) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile) return { success: false, error: "Profile not found" }

        const { error } = await supabase
            .from('staff_attendance_disputes')
            .insert({
                tenant_id: profile.tenant_id,
                staff_id: user.id,
                audit_log_id: data.auditLogId,
                distance_detected: data.distanceDetected,
                reason: data.reason,
                proof_url: data.proofUrl,
                status: 'pending'
            })

        if (error) throw error

        // Forensic Log for the dispute submission itself
        await supabase.from('audit_logs').insert({
            tenant_id: profile.tenant_id,
            actor_id: user.id,
            action: 'DISPUTE_SUBMITTED',
            category: 'Security',
            entity_type: 'staff_attendance',
            details: `Dispute submitted for failed clock-in (${data.distanceDetected}m). Reason: ${data.reason.slice(0, 50)}...`,
            metadata: {
                auditLogId: data.auditLogId,
                distance: data.distanceDetected
            }
        })

        revalidatePath('/dashboard/attendance')
        return { success: true }

    } catch (error: any) {
        console.error("Error submitting dispute:", error)
        return { success: false, error: error.message }
    }
}
