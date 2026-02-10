'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get the current user's profile and tenant ID
 */
async function getAuthContext() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) throw new Error("Tenant context missing")
    return { user, tenantId: profile.tenant_id, role: profile.role }
}

// --- 1. Hostels & Allocation ---

export async function getHostelsWithStats() {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { data: buildings, error } = await supabase
            .from('hostel_buildings')
            .select(`
                *,
                rooms:hostel_rooms(
                    id, name, capacity,
                    bunks:hostel_bunks(
                        id, label, type, is_serviceable,
                        allocations:hostel_allocations(
                            id, status,
                            student:students(id, full_name)
                        )
                    )
                )
            `)
            .eq('tenant_id', tenantId)

        if (error) throw error

        // Transform to flat structure for visualizer
        const transformed = (buildings || []).map(b => ({
            ...b,
            rooms: b.rooms.map((r: any) => ({
                ...r,
                bunks: r.bunks.map((bk: any) => {
                    const activeAlloc = bk.allocations?.find((a: any) => a.status === 'active')
                    return {
                        id: bk.id,
                        label: bk.label,
                        type: bk.type,
                        is_serviceable: bk.is_serviceable,
                        student: activeAlloc?.student ? {
                            id: activeAlloc.student.id,
                            name: activeAlloc.student.full_name,
                            class: 'Assigned' // We can expand this later
                        } : null
                    }
                })
            }))
        }))

        return { success: true, data: transformed }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function allocateStudent(studentId: string, bunkId: string, term: string, session: string) {
    try {
        const { user, tenantId } = await getAuthContext()
        const supabase = createClient()

        // Insert allocation
        const { error } = await supabase
            .from('hostel_allocations')
            .insert({
                tenant_id: tenantId,
                student_id: studentId,
                bunk_id: bunkId,
                term,
                session,
                allocated_by: user.id
            })

        if (error) throw error

        revalidatePath('/dashboard/admin/hostels', 'layout')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// --- 2. Inventory ---

export async function createInventoryItem(data: { name: string, total_quantity: number, condition: string }) {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { error } = await supabase
            .from('hostel_inventory_items')
            .insert({
                tenant_id: tenantId,
                name: data.name,
                total_quantity: data.total_quantity,
                available_quantity: data.total_quantity,
                condition: data.condition
            })

        if (error) throw error
        revalidatePath('/dashboard/admin/hostels/inventory')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getInventoryItems() {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { data, error } = await supabase
            .from('hostel_inventory_items')
            .select('*')
            .eq('tenant_id', tenantId)

        if (error) throw error
        return { success: true, data: data || [] }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function assignInventoryItem(studentId: string, itemId: string, quantity: number = 1) {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { error } = await supabase
            .from('hostel_inventory_assignments')
            .insert({
                tenant_id: tenantId,
                student_id: studentId,
                item_id: itemId,
                quantity
            })

        if (error) throw error
        revalidatePath('/dashboard/admin/hostels/inventory')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// --- 3. Roll Call ---

export async function submitRollCall(data: {
    buildingId: string,
    rollCallDate: Date,
    entries: { studentId: string, status: string }[]
}) {
    try {
        const { user, tenantId } = await getAuthContext()
        const supabase = createClient()

        // 1. Create Roll Call Header
        const { data: header, error: headErr } = await supabase
            .from('hostel_roll_calls')
            .insert({
                tenant_id: tenantId,
                building_id: data.buildingId,
                date: data.rollCallDate,
                checked_by: user.id
            })
            .select()
            .single()

        if (headErr) throw headErr

        // 2. Insert Entries
        const rows = data.entries.map(e => ({
            roll_call_id: header.id,
            student_id: e.studentId,
            status: e.status
        }))

        const { error: linesErr } = await supabase
            .from('hostel_roll_call_entries')
            .insert(rows)

        if (linesErr) throw linesErr

        revalidatePath('/dashboard/admin/hostels/night-check')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// --- 4. Maintenance ---

export async function createMaintenanceTicket(title: string, desc: string, priority: string, locationId?: string) {
    try {
        const { user, tenantId } = await getAuthContext()
        const supabase = createClient()

        const { error } = await supabase
            .from('maintenance_items')
            .insert({
                tenant_id: tenantId,
                title,
                description: desc,
                priority,
                location_id: locationId,
                reported_by: user.id
            })

        if (error) throw error
        revalidatePath('/dashboard/admin/hostels/maintenance')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getMaintenanceTickets() {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { data, error } = await supabase
            .from('maintenance_items')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, data: data || [] }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
