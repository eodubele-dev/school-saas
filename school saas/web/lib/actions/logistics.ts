'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { sendSMS } from "@/lib/services/termii"
import { SMS_CONFIG } from "@/lib/constants/communication"

/**
 * Fetch all routes for the tenant
 */
export async function getRoutes() {
    try {
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
    } catch (error) {
        console.error('[logistics] getRoutes error:', error)
        return []
    }
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
    try {
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
        const { data: assignments } = await supabase
            .from('transport_assignments')
            .select('student_id')
            .eq('route_id', routeId)
            .eq('tenant_id', profile.tenant_id)

        if (!assignments || assignments.length === 0) return null

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

        if (createError || !newManifest) return null

        const items = assignments.map(a => ({
            manifest_id: newManifest.id,
            student_id: a.student_id,
            status: direction === 'dropoff' ? 'boarded' : 'pending'
        }))

        await supabase.from('transport_manifest_items').insert(items)

        const { data: finalManifest } = await supabase
            .from('transport_manifest')
            .select(`
                *,
                items:transport_manifest_items(
                    *,
                    student:students(first_name, last_name, admission_number)
                )
            `)
            .eq('id', newManifest.id)
            .single()

        return finalManifest || null
    } catch (error) {
        console.error('[logistics] getDailyManifest error:', error)
        return null
    }
}

/**
 * Start the Trip (Updates status to Active)
 */
export async function startTrip(manifestId: string) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Fetch manifest and its items to get parent contact info
        const { data: manifest, error: fetchErr } = await supabase
            .from('transport_manifest')
            .select(`
                *,
                items:transport_manifest_items(
                    student:students(
                        first_name,
                        last_name,
                        parent:profiles!parent_id(full_name, phone, phone_number)
                    )
                )
            `)
            .eq('id', manifestId)
            .single()

        if (fetchErr || !manifest) throw new Error("Manifest not found")

        // 2. Update status to active
        const { error: updateErr } = await supabase.from('transport_manifest')
            .update({ status: 'active', started_at: new Date().toISOString() })
            .eq('id', manifestId)

        if (updateErr) throw updateErr

        // 3. Broadcast Notifications
        const tenantId = manifest.tenant_id
        const direction = manifest.direction
        const items = manifest.items || []

        if (tenantId) {
            const { data: tenant } = await supabase
                .from('tenants')
                .select('name, sms_balance')
                .eq('id', tenantId)
                .single()

            if (tenant) {
                const SMS_COST = SMS_CONFIG.UNIT_COST
                let currentBalance = Number(tenant.sms_balance) || 0
                const message = direction === 'pickup'
                    ? `SAFE-ROUTE: The bus for your child's morning pickup has started its route.`
                    : `SAFE-ROUTE: The bus for your child's afternoon drop-off has departed the school.`

                // Unique parents to avoid double-charging for siblings on the same bus
                const parentMap = new Map()
                items.forEach((item: any) => {
                    const parent = item.student?.parent
                    const phone = parent?.phone || parent?.phone_number
                    if (phone && !parentMap.has(phone)) {
                        parentMap.set(phone, parent.full_name || 'Parent')
                    }
                })

                for (const [phone, name] of Array.from(parentMap.entries())) {
                    if (currentBalance >= SMS_COST) {
                        const smsRes = await sendSMS(phone, message)
                        if (smsRes.success) {
                            currentBalance -= SMS_COST
                            await supabase.from('message_logs').insert({
                                tenant_id: tenantId,
                                sender_id: user?.id,
                                recipient_phone: phone,
                                recipient_name: name,
                                message_content: message,
                                channel: 'sms',
                                status: 'sent',
                                cost: SMS_COST,
                                provider_ref: (smsRes.data as any)?.message_id
                            })
                        }
                    }
                }

                // Final balance update
                await supabase.from('tenants').update({ sms_balance: currentBalance }).eq('id', tenantId)
            }
        }

        revalidatePath('/dashboard/logistics')
        return { success: true }
    } catch (error) {
        console.error('[logistics] startTrip error:', error)
        return { success: false, error: "Failed to start trip." }
    }
}

/**
 * Check-In / Check-Out Student
 * Triggers Production Notifications
 */
export async function updateManifestItemStatus(itemId: string, status: 'boarded' | 'dropped') {
    try {
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

                if (message && currentBalance >= SMS_COST) {
                    const smsRes = await sendSMS(phone, message)

                    if (smsRes.success) {
                        await supabase
                            .from('tenants')
                            .update({ sms_balance: currentBalance - SMS_COST })
                            .eq('id', tenantId)

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
    } catch (error) {
        console.error('[logistics] updateManifestItemStatus error:', error)
        return { success: false, error: "System encountered an error processing the update." }
    }
}

/**
 * Fetch students assigned to a specific route
 */
export async function getRouteAssignments(routeId: string) {
    try {
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
    } catch (error) {
        console.error('[logistics] getRouteAssignments error:', error)
        return []
    }
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
    try {
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

        revalidatePath('/dashboard/logistics')
        return { success: true }
    } catch (error) {
        console.error('[logistics] assignStudent error:', error)
        return { success: false, error: "Failed to assign student." }
    }
}

/**
 * Remove a student assignment
 */
export async function removeStudentAssignment(assignmentId: string) {
    try {
        const supabase = createClient()
        const { error } = await supabase.from('transport_assignments').delete().eq('id', assignmentId)

        if (error) return { success: false, error: error.message }

        revalidatePath('/dashboard/logistics')
        return { success: true }
    } catch (error) {
        console.error('[logistics] removeAssignment error:', error)
        return { success: false, error: "Failed to remove assignment." }
    }
}
