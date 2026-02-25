'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendSMS } from "@/lib/services/termii"
import { SMS_CONFIG } from "@/lib/constants/communication"

/**
 * Fetch all routes for the tenant
 */
export async function getRoutes() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) return []

    const { data } = await supabase
        .from('transport_routes')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name')
    return data || []
}

export async function createRoute(data: { name: string, vehicle: string, driver: string, attendant?: string }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) return { success: false, error: "Tenant not found" }

    const { error } = await supabase.from('transport_routes').insert({
        tenant_id: profile.tenant_id,
        name: data.name,
        vehicle_number: data.vehicle,
        driver_name: data.driver,
        attendant_name: data.attendant
    })

    if (error) return { success: false, error: error.message }
    revalidatePath('/dashboard/logistics')
    return { success: true }
}

/**
 * Get or Create a Daily Manifest for a specific Route & Direction
 * If it doesn't exist for Today, it creates it and populates it from assignments.
 */
export async function getDailyManifest(routeId: string, direction: 'pickup' | 'dropoff') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) return null

    const today = new Date().toISOString().split('T')[0]

    // 1. Try to find existing manifest
    const { data: existing } = await supabase
        .from('transport_manifest')
        .select(`
            *,
            items:transport_manifest_items(
                *,
                student:students(first_name, last_name, admission_number)
            )
        `)
        .eq('route_id', routeId)
        .eq('tenant_id', profile.tenant_id)
        .eq('date', today)
        .eq('direction', direction)
        .single()

    if (existing) {
        return existing
    }

    // 2. Create New Manifest
    // Get assignments for this route
    const { data: assignments } = await supabase
        .from('transport_assignments')
        .select('student_id')
        .eq('route_id', routeId)
        .eq('tenant_id', profile.tenant_id)

    if (!assignments || assignments.length === 0) return null // No students assigned

    // Create Header
    const { data: newManifest, error: createError } = await supabase
        .from('transport_manifest')
        .insert({
            tenant_id: profile.tenant_id,
            route_id: routeId,
            date: today,
            direction,
            status: 'pending'
        })
        .select()
        .single()

    if (createError || !newManifest) {
        console.error("Failed to create manifest", createError)
        return null
    }

    // Populate Items
    const items = assignments.map(a => ({
        manifest_id: newManifest.id,
        student_id: a.student_id,
        status: 'pending'
    }))

    await supabase.from('transport_manifest_items').insert(items)

    // Return with students joined
    return await getDailyManifest(routeId, direction)
}

/**
 * Start the Trip (Updates status to Active)
 */
export async function startTrip(manifestId: string) {
    const supabase = createClient()
    await supabase.from('transport_manifest')
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', manifestId)

    revalidatePath('/dashboard/logistics')
}

/**
 * Check-In / Check-Out Student
 * Triggers Production Notifications
 */
export async function updateManifestItemStatus(itemId: string, status: 'boarded' | 'dropped') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Update Manifest Item
    const updateData: any = { status }
    if (status === 'boarded') updateData.boarded_at = new Date().toISOString()
    if (status === 'dropped') updateData.dropped_at = new Date().toISOString()

    const { data: item, error } = await supabase
        .from('transport_manifest_items')
        .update(updateData)
        .eq('id', itemId)
        .select(`
            *,
            student:students(
                tenant_id,
                first_name, 
                last_name,
                parent:profiles!parent_id(full_name, phone, phone_number)
            ),
            manifest:transport_manifest(direction)
        `)
        .single()

    if (error || !item || !item.student) return { success: false, error: "Item not found" }

    const tenantId = item.student.tenant_id
    const direction = item.manifest?.direction
    const parent = item.student.parent as any
    const phone = parent?.phone || parent?.phone_number
    const studentName = item.student.first_name || 'Student'

    // 2. Production Notification Logic
    if (phone && tenantId) {
        // Fetch Tenant Branding & Balance
        const { data: tenant } = await supabase
            .from('tenants')
            .select('name, sms_balance')
            .eq('id', tenantId)
            .single()

        if (tenant) {
            let message = ""
            const SMS_COST = SMS_CONFIG.UNIT_COST
            let currentBalance = Number(tenant.sms_balance) || 0

            if (status === 'boarded') {
                message = direction === 'pickup'
                    ? `SAFE-ROUTE: ${studentName} has boarded the bus to school. Expected arrival: 8:00 AM.`
                    : `SAFE-ROUTE: ${studentName} has boarded the bus home. We are 10-15 mins away.`
            } else if (status === 'dropped') {
                message = direction === 'pickup'
                    ? `SAFE-ROUTE: ${studentName} has safely arrived at school.`
                    : `SAFE-ROUTE: ${studentName} has been dropped off at home.`
            }

            // Wallet Check & Send
            if (message && currentBalance >= SMS_COST) {
                const smsRes = await sendSMS(phone, message)

                if (smsRes.success) {
                    // Update Balance
                    await supabase
                        .from('tenants')
                        .update({ sms_balance: currentBalance - SMS_COST })
                        .eq('id', tenantId)

                    // Log Communication
                    await supabase.from('message_logs').insert({
                        tenant_id: tenantId,
                        sender_id: user.id,
                        recipient_phone: phone,
                        recipient_name: parent?.full_name || 'Parent',
                        message_content: message,
                        channel: 'sms',
                        status: 'sent',
                        cost: SMS_COST,
                        provider_ref: (smsRes.data as any)?.message_id
                    })
                }
            }
        }
    }

    revalidatePath('/dashboard/logistics')
    return { success: true }
}

/**
 * Fetch students assigned to a specific route
 */
export async function getRouteAssignments(routeId: string) {
    const supabase = createClient()
    const { data } = await supabase
        .from('transport_assignments')
        .select(`
            id,
            student_id,
            stop_location,
            direction,
            student:students(id, first_name, last_name, admission_number)
        `)
        .eq('route_id', routeId)

    return data || []
}

/**
 * Assign a student to a route
 */
export async function assignStudentToRoute(data: {
    routeId: string,
    studentId: string,
    stopLocation?: string,
    direction?: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) return { success: false, error: "Tenant not found" }

    const { error } = await supabase.from('transport_assignments').insert({
        tenant_id: profile.tenant_id,
        route_id: data.routeId,
        student_id: data.studentId,
        stop_location: data.stopLocation,
        direction: data.direction || 'both'
    })

    if (error) return { success: false, error: error.message }

    // Also revalidate the logistics page
    revalidatePath('/dashboard/logistics')
    return { success: true }
}

/**
 * Remove a student assignment
 */
export async function removeStudentAssignment(assignmentId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('transport_assignments').delete().eq('id', assignmentId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/logistics')
    return { success: true }
}
