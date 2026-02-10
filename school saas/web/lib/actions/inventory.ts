'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. Dashboard Stats ---

export async function getInventoryStats() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Get Items for Valuation and Low Stock
    const { data: items } = await supabase.from('inventory_items').select('quantity_on_hand, unit_cost, reorder_level')

    let totalValuation = 0
    let lowStockCount = 0

    if (items) {
        items.forEach(item => {
            const qty = item.quantity_on_hand || 0
            const cost = item.unit_cost || 0
            totalValuation += qty * cost
            if (qty <= (item.reorder_level || 0)) {
                lowStockCount++
            }
        })
    }

    // 2. Get Pending Requests
    const { count: pendingCount } = await supabase
        .from('inventory_requisitions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    // 3. Calculate Monthly Usage Change
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString()

    const { data: transactions } = await supabase
        .from('inventory_transactions')
        .select('quantity_change, created_at, type')
        .gte('created_at', prevMonthStart)
        .in('type', ['requisition', 'sale', 'adjustment'])

    let currentMonthUsage = 0
    let prevMonthUsage = 0

    if (transactions) {
        transactions.forEach(t => {
            // Usage is items going OUT (negative quantity_change)
            if (t.quantity_change < 0) {
                const amount = Math.abs(t.quantity_change)
                if (t.created_at >= currentMonthStart) {
                    currentMonthUsage += amount
                } else if (t.created_at <= prevMonthEnd) {
                    prevMonthUsage += amount
                }
            }
        })
    }

    let monthlyUsageChange = 0
    if (prevMonthUsage > 0) {
        monthlyUsageChange = Math.round(((currentMonthUsage - prevMonthUsage) / prevMonthUsage) * 100)
    } else if (currentMonthUsage > 0) {
        monthlyUsageChange = 100 // Started using items this month
    }

    return {
        success: true,
        data: {
            totalValuation,
            lowStockCount,
            pendingRequestsCount: pendingCount || 0,
            monthlyUsageChange
        }
    }
}

// --- 2. Stock Management ---

export async function getInventoryItems() {
    const supabase = createClient()
    const { data } = await supabase
        .from('inventory_items')
        .select(`
            *,
            category:inventory_categories(name),
            vendor:inventory_vendors(name)
        `)
        .order('name')

    return { success: true, data: data || [] }
}

export async function getInventoryCategories() {
    const supabase = createClient()
    const { data } = await supabase.from('inventory_categories').select('*').order('name')
    return { success: true, data: data || [] }
}

export async function createInventoryCategory(data: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Tenant from profile
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) return { success: false, error: "Tenant not found" }

    const { error } = await supabase.from('inventory_categories').insert({
        ...data,
        tenant_id: profile.tenant_id
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/inventory/categories')
    revalidatePath('/dashboard/admin/inventory/stock')
    return { success: true }
}

export async function updateInventoryCategory(id: string, data: any) {
    const supabase = createClient()

    const { error } = await supabase.from('inventory_categories').update(data).eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/inventory/categories')
    revalidatePath('/dashboard/admin/inventory/stock')
    return { success: true }
}

export async function deleteInventoryCategory(id: string) {
    const supabase = createClient()

    const { error } = await supabase.from('inventory_categories').delete().eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/inventory/categories')
    revalidatePath('/dashboard/admin/inventory/stock')
    return { success: true }
}

export async function getInventoryVendors() {
    const supabase = createClient()
    const { data } = await supabase.from('inventory_vendors').select('*').order('name')
    return { success: true, data: data || [] }
}

export async function createInventoryVendor(data: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Tenant from profile
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) return { success: false, error: "Tenant not found" }

    const { error } = await supabase.from('inventory_vendors').insert({
        ...data,
        tenant_id: profile.tenant_id
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/inventory/vendors')
    revalidatePath('/dashboard/admin/inventory/stock')
    return { success: true }
}

export async function updateInventoryVendor(id: string, data: any) {
    const supabase = createClient()

    const { error } = await supabase.from('inventory_vendors').update(data).eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/inventory/vendors')
    revalidatePath('/dashboard/admin/inventory/stock')
    return { success: true }
}

export async function deleteInventoryVendor(id: string) {
    const supabase = createClient()

    const { error } = await supabase.from('inventory_vendors').delete().eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/inventory/vendors')
    revalidatePath('/dashboard/admin/inventory/stock')
    return { success: true }
}


export async function restockItem(itemId: string, quantity: number, unitCost: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Get current stock
    const { data: item } = await supabase.from('inventory_items').select('*').eq('id', itemId).single()
    if (!item) return { success: false, error: "Item not found" }

    // 2. Calculate new Moving Average Cost (Simple Average for now)
    // New Value = (OldQty * OldCost) + (NewQty * NewCost) / TotalQty
    const oldVal = (item.quantity_on_hand || 0) * (item.unit_cost || 0)
    const newVal = quantity * unitCost
    const newTotalQty = (item.quantity_on_hand || 0) + quantity
    const newAvgCost = newTotalQty > 0 ? (oldVal + newVal) / newTotalQty : unitCost

    // 3. Update Item
    const { error } = await supabase.from('inventory_items').update({
        quantity_on_hand: newTotalQty,
        unit_cost: newAvgCost
    }).eq('id', itemId)

    if (error) return { success: false, error: error.message }

    // 4. Log Transaction
    await supabase.from('inventory_transactions').insert({
        item_id: itemId,
        type: 'purchase',
        quantity_change: quantity,
        cost_at_transaction: unitCost,
        performed_by: user?.id,
        note: `Restocked ${quantity} units @ ${unitCost}`
    })

    revalidatePath('/dashboard/admin/inventory')
    return { success: true }
}

export async function createInventoryItem(data: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get Tenant from profile
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

    if (!profile?.tenant_id) return { success: false, error: "Tenant not found" }

    const { error } = await supabase.from('inventory_items').insert({
        ...data,
        tenant_id: profile.tenant_id
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/inventory')
    revalidatePath('/dashboard/admin/inventory/stock')
    return { success: true }
}

export async function deleteInventoryItem(itemId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('inventory_items').delete().eq('id', itemId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/inventory')
    revalidatePath('/dashboard/admin/inventory/stock')
    return { success: true }
}

// --- 3. Requisitions Workflow ---

export async function submitRequisition(items: { itemId: string, qty: number }[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Create Request Header
    const { data: req, error } = await supabase.from('inventory_requisitions').insert({
        requested_by: user?.id,
        status: 'pending'
    }).select().single()

    if (error) return { success: false, error: error.message }

    // 2. Add Line Items
    const lines = items.map(i => ({
        requisition_id: req.id,
        item_id: i.itemId,
        quantity_requested: i.qty
    }))

    await supabase.from('inventory_requisition_items').insert(lines)

    revalidatePath('/dashboard/admin/inventory/requisitions')
    return { success: true }
}

export async function approveRequisition(reqId: string, items: { itemId: string, approvedQty: number }[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Update items stock
    for (const item of items) {
        // Decrease stock
        // Note: In real app, use RPC for atomic decrement to prevent race conditions
        const { data: invItem } = await supabase.from('inventory_items').select('quantity_on_hand').eq('id', item.itemId).single()

        if (invItem && invItem.quantity_on_hand >= item.approvedQty) {
            await supabase.from('inventory_items').update({
                quantity_on_hand: invItem.quantity_on_hand - item.approvedQty
            }).eq('id', item.itemId)

            // Log Transaction
            await supabase.from('inventory_transactions').insert({
                item_id: item.itemId,
                type: 'requisition',
                quantity_change: -item.approvedQty,
                performed_by: user?.id,
                reference_id: reqId,
                note: 'Approved Requisition'
            })
        }
    }

    // 2. Update Request Status
    await supabase.from('inventory_requisitions').update({
        status: 'approved',
        approved_by: user?.id,
        approval_date: new Date().toISOString()
    }).eq('id', reqId)

    revalidatePath('/dashboard/admin/inventory/requisitions')
    return { success: true }
}

export async function rejectRequisition(reqId: string, reason: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('inventory_requisitions').update({
        status: 'rejected',
        rejection_reason: reason,
        approved_by: user?.id, // or rejected_by if column existed, reusing approved_by as 'actioned_by' effectively
        approval_date: new Date().toISOString()
    }).eq('id', reqId)

    revalidatePath('/dashboard/admin/inventory/requisitions')
    return { success: true }
}

export async function getRequisitions() {
    const supabase = createClient()
    const { data } = await supabase
        .from('inventory_requisitions')
        .select(`
            *,
            requested_by_profile:profiles!inventory_requisitions_requested_by_fkey(full_name, role),
            items:inventory_requisition_items(
                quantity_requested, 
                item_id,
                item:inventory_items(name, unit_type)
            )
        `)
        .order('created_at', { ascending: false })

    return { success: true, data: data || [] }
}

// --- 4. Alerts ---
// This would typically be a scheduled job or reacting to changes,
// but for the dashboard, we just fetch low stock items.

export async function getLowStockItems() {
    const supabase = createClient()
    // Select items where quantity <= reorder_level (Need manual filter or RP, since supabase js filter comparison of two columns is tricky without RPC)
    // We'll fetch all and filter in JS for MVP simplicity or use RPC later.
    const { data } = await supabase.from('inventory_items').select('*')

    if (!data) return []

    return data.filter(item => item.quantity_on_hand <= item.reorder_level)
}

export async function getLowStockItemsWithDetails() {
    const supabase = createClient()
    const { data } = await supabase
        .from('inventory_items')
        .select(`
            *,
            category:inventory_categories(name)
        `)
        .order('quantity_on_hand', { ascending: true })

    if (!data) return []

    return data.filter(item => item.quantity_on_hand <= (item.reorder_level || 10))
}
