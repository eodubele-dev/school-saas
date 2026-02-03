'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. Hostels & Allocation ---

export async function getHostelsWithStats() {
    const supabase = createClient()

    // Fetch buildings
    const { data: buildings, error } = await supabase
        .from('hostel_buildings')
        .select(`
            *,
            rooms:hostel_rooms(
                id, capacity,
                bunks:hostel_bunks(id, type, is_serviceable)
            )
        `)

    if (error) return { success: false, error: error.message }

    // We'll calculate occupancy on the client or via a complex query
    // For now, return raw structure
    return { success: true, data: buildings }
}

export async function allocateStudent(studentId: string, bunkId: string, term: string, session: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if bunk occupied (optionally)
    // Check if student already has allocation for this term

    // Insert allocation
    const { error } = await supabase
        .from('hostel_allocations')
        .insert({
            student_id: studentId,
            bunk_id: bunkId,
            term,
            session,
            allocated_by: user?.id
        })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/hostels')
    return { success: true }
}

// --- 2. Inventory ---

export async function getInventoryItems() {
    const supabase = createClient()
    const { data } = await supabase.from('hostel_inventory_items').select('*')
    return { success: true, data: data || [] }
}

export async function assignInventoryItem(studentId: string, itemId: string, quantity: number = 1) {
    const supabase = createClient()

    const { error } = await supabase
        .from('hostel_inventory_assignments')
        .insert({
            student_id: studentId,
            item_id: itemId,
            quantity
        })

    if (error) return { success: false, error: error.message }
    revalidatePath('/dashboard/admin/hostels/inventory')
    return { success: true }
}

// --- 3. Roll Call ---

export async function submitRollCall(data: {
    buildingId: string,
    rollCallDate: Date,
    entries: { studentId: string, status: string }[]
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Create Roll Call Heaer
    const { data: header, error: headErr } = await supabase
        .from('hostel_roll_calls')
        .insert({
            building_id: data.buildingId,
            date: data.rollCallDate,
            checked_by: user?.id
        })
        .select()
        .single()

    if (headErr) return { success: false, error: headErr.message }

    // 2. Insert Entries
    const rows = data.entries.map(e => ({
        roll_call_id: header.id,
        student_id: e.studentId,
        status: e.status
    }))

    const { error: linesErr } = await supabase
        .from('hostel_roll_call_entries')
        .insert(rows)

    if (linesErr) return { success: false, error: linesErr.message }

    // Check constraints: If time > 9PM and status=absent -> TRIGGER ALERT (via logic or db trigger)
    // Here we can just check momentarily
    const absentees = data.entries.filter(e => e.status === 'absent')
    if (absentees.length > 0) {
        // In a real app, send push notification to Proprietor
        console.log("ALERT: Absentees detected", absentees)
    }

    revalidatePath('/dashboard/admin/hostels/night-check')
    return { success: true }
}

// --- 4. Maintenance ---

export async function createMaintenanceTicket(title: string, desc: string, priority: string, locationId?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('maintenance_items')
        .insert({
            title,
            description: desc,
            priority,
            location_id: locationId,
            reported_by: user?.id
        })

    if (error) return { success: false, error: error.message }
    revalidatePath('/dashboard/admin/hostels/maintenance')
    return { success: true }
}

export async function getMaintenanceTickets() {
    const supabase = createClient()

    const { data } = await supabase
        .from('maintenance_items')
        .select('*')
        .order('created_at', { ascending: false })

    return { success: true, data: data || [] }
}
