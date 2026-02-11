'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { logActivity } from './audit'

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

/**
 * Get current academic settings for the tenant
 */
export async function getAcademicSettings() {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { data, error } = await supabase
            .from('academic_settings')
            .select('current_session, current_term')
            .eq('tenant_id', tenantId)
            .single()

        if (error || !data) {
            // Fallback for safety during setup
            return { session: "2024/2025", term: "1st Term" }
        }

        return { session: data.current_session, term: data.current_term }
    } catch (e) {
        return { session: "2024/2025", term: "1st Term" }
    }
}

// --- 1. Hostels & Allocation ---

export async function getHostelsWithStats() {
    noStore()
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
                            student:students(id, full_name, passport_url)
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
                            passport_url: activeAlloc.student.passport_url,
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

export async function createBuilding(data: { name: string, type: string }) {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { data: building, error } = await supabase
            .from('hostel_buildings')
            .insert({
                tenant_id: tenantId,
                name: data.name,
                type: data.type
            })
            .select()
            .single()

        if (error) throw error
        revalidatePath('/[domain]/dashboard/admin/hostels', 'layout')
        return { success: true, data: building }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function createRoom(data: { buildingId: string, name: string, capacity: number, floor?: number }) {
    try {
        const supabase = createClient()

        // 1. Create Room
        const { data: room, error: roomErr } = await supabase
            .from('hostel_rooms')
            .insert({
                building_id: data.buildingId,
                name: data.name,
                capacity: data.capacity,
                floor: data.floor || 0
            })
            .select()
            .single()

        if (roomErr) throw roomErr

        // 2. Auto-generate bunks based on capacity
        const bunks = []
        for (let i = 1; i <= data.capacity; i++) {
            bunks.push({
                room_id: room.id,
                label: `Bed ${i}`,
                type: 'single'
            })
        }

        const { error: bunkErr } = await supabase
            .from('hostel_bunks')
            .insert(bunks)

        if (bunkErr) throw bunkErr

        revalidatePath('/[domain]/dashboard/admin/hostels', 'layout')
        return { success: true, data: room }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function deleteBuilding(id: string) {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { error } = await supabase
            .from('hostel_buildings')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId)

        if (error) throw error
        revalidatePath('/[domain]/dashboard/admin/hostels', 'layout')
        return { success: true }
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

        await logActivity(
            'System',
            'STUDENT_ALLOCATED',
            `Student allocated to bunk ${bunkId}`,
            'hostel_allocation',
            studentId,
            null,
            { student_id: studentId, bunk_id: bunkId }
        )

        revalidatePath('/[domain]/dashboard/admin/hostels', 'layout')
        return { success: true }
    } catch (e: any) {
        if (e.code === '23505') {
            return { success: false, error: "This student is already allocated to a room for this term." }
        }
        return { success: false, error: e.message }
    }
}

export async function vacateStudent(bunkId: string) {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        // Update allocation status to 'vacated'
        const { error } = await supabase
            .from('hostel_allocations')
            .update({ status: 'vacated' })
            .eq('bunk_id', bunkId)
            .eq('status', 'active')
            .eq('tenant_id', tenantId)

        if (error) throw error

        revalidatePath('/[domain]/dashboard/admin/hostels', 'layout')
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
        revalidatePath('/[domain]/dashboard/admin/hostels/inventory', 'page')
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
        revalidatePath('/[domain]/dashboard/admin/hostels/inventory', 'page')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getInventoryAssignments(itemId: string) {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { data, error } = await supabase
            .from('hostel_inventory_assignments')
            .select(`
                id,
                quantity,
                created_at,
                students (id, full_name, admission_number)
            `)
            .eq('item_id', itemId)
            .eq('tenant_id', tenantId)

        if (error) throw error
        return { success: true, data: data || [] }
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

        revalidatePath('/[domain]/dashboard/admin/hostels/night-check', 'page')
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
                description: locationId ? `${locationId}: ${desc}` : desc,
                priority,
                reported_by: user.id
            })

        if (error) throw error

        await logActivity(
            'System',
            'MAINTENANCE_LOGGED',
            `New maintenance ticket: ${title}`,
            'maintenance_item',
            undefined,
            null,
            { title, priority, locationId }
        )

        revalidatePath('/[domain]/dashboard/admin/hostels', 'layout')
        revalidatePath('/[domain]/dashboard/admin/hostels/maintenance', 'page')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function getMaintenanceTickets() {
    noStore()
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { data, error } = await supabase
            .from('maintenance_items')
            .select(`
                *,
                assigned_staff:profiles!maintenance_items_assigned_to_fkey(full_name)
            `)
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { success: true, data: data || [] }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function updateMaintenanceTicket(id: string, updates: any) {
    try {
        const { tenantId } = await getAuthContext()
        const supabase = createClient()

        const { error } = await supabase
            .from('maintenance_items')
            .update(updates)
            .eq('id', id)
            .eq('tenant_id', tenantId)

        if (error) throw error
        revalidatePath('/[domain]/dashboard/admin/hostels', 'layout')
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}