'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// --- 1. Stock Management ---

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

// --- 2. Requisitions Workflow ---

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

// --- 3. Alerts ---
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
