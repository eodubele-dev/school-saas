'use server'

import { createClient } from "@/lib/supabase/server"
import { ChannelSimulator } from "@/lib/notifications/channels"
import { revalidatePath } from "next/cache"

/**
 * Fetch all routes for the tenant
 */
export async function getRoutes() {
    const supabase = createClient()
    const { data } = await supabase.from('transport_routes').select('*').order('name')
    return data || []
}

export async function createRoute(data: { name: string, vehicle: string, driver: string }) {
    const supabase = createClient()
    const { error } = await supabase.from('transport_routes').insert({
        name: data.name,
        vehicle_number: data.vehicle,
        driver_name: data.driver
    })

    if (error) return { success: false, error: error.message }
    revalidatePath('/dashboard/admin/logistics') // Fix: Correct revalidate path
    return { success: true }
}

/**
 * Get or Create a Daily Manifest for a specific Route & Direction
 * If it doesn't exist for Today, it creates it and populates it from assignments.
 */
export async function getDailyManifest(routeId: string, direction: 'pickup' | 'dropoff') {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    // 1. Try to find existing manifest
    const { data: existing } = await supabase
        .from('transport_manifest')
        .select(`
            *,
            items:transport_manifest_items(
                *,
                student:students(first_name, last_name, admission_number, parent_phone:phone)
            )
        `)
        .eq('route_id', routeId)
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

    if (!assignments) return null // No students assignment

    // Create Header
    const { data: newManifest, error: createError } = await supabase
        .from('transport_manifest')
        .insert({
            route_id: routeId,
            date: today,
            direction,
            status: 'pending' // Trip hasn't started
        })
        .select()
        .single()

    if (createError || !newManifest) {
        console.error("Failed to create manifest", createError)
        return null
    }

    // Populate Items
    if (assignments.length > 0) {
        const items = assignments.map(a => ({
            manifest_id: newManifest.id,
            student_id: a.student_id,
            status: 'pending'
        }))

        await supabase.from('transport_manifest_items').insert(items)
    }

    // Return structure (reload to get students joined)
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

    revalidatePath('/admin/logistics')
}

/**
 * Check-In / Check-Out Student
 * Triggers Notifications
 */
export async function updateManifestItemStatus(itemId: string, status: 'boarded' | 'dropped') {
    const supabase = createClient()

    // 1. Update DB
    const updateData: any = { status }
    if (status === 'boarded') updateData.boarded_at = new Date().toISOString()
    if (status === 'dropped') updateData.dropped_at = new Date().toISOString()

    const { data: item, error } = await supabase
        .from('transport_manifest_items')
        .update(updateData)
        .eq('id', itemId)
        .select(`
            *,
            student:students(first_name, last_name, phone),
            manifest:transport_manifest(direction)
        `)
        .single()

    if (error || !item) return { success: false }

    // 2. Trigger Notification
    // We use the simulator directly here or call notification engine. 
    // Ideally, we keep it simple here.

    const studentName = item.student?.first_name || 'Student'
    const parentPhone = item.student?.phone // Assuming student record has parent phone
    const direction = item.manifest?.direction

    if (parentPhone) {
        let message = ""

        if (status === 'boarded') {
            if (direction === 'pickup') {
                message = `SAFE-ROUTE: ${studentName} has boarded the bus to school. Expected arrival: 8:00 AM.`
            } else {
                message = `SAFE-ROUTE: ${studentName} has boarded the bus home. We are 10-15 mins away.`
            }
        } else if (status === 'dropped') {
            if (direction === 'pickup') {
                message = `SAFE-ROUTE: ${studentName} has safely arrived at school.`
            } else {
                message = `SAFE-ROUTE: ${studentName} has been dropped off at home.`
            }
        }

        if (message) {
            // Fire and forget notification
            ChannelSimulator.sms({
                to: parentPhone,
                message
            })
        }
    }

    revalidatePath('/admin/logistics')
    return { success: true }
}
