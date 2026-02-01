"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// --- Fee Categories ---

export async function upsertFeeCategory(data: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!['admin', 'bursar'].includes(profile?.role)) return { success: false, error: "Permission denied" }

    const { error } = await supabase
        .from('fee_categories')
        .upsert({ ...data, tenant_id: profile.tenant_id })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function deleteFeeCategory(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('fee_categories').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true }
}

// --- Fee Schedule (Matrix) ---

export async function updateFeeSchedule(updates: any[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!['admin', 'bursar'].includes(profile?.role)) return { success: false, error: "Permission denied" }

    const data = updates.map(u => ({ ...u, tenant_id: profile.tenant_id }))

    const { error } = await supabase
        .from('fee_schedule')
        .upsert(data, { onConflict: 'class_id, category_id' })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// --- Invoice Generation ---

export async function generateTermlyInvoices(domain: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!['admin', 'bursar'].includes(profile?.role)) return { success: false, error: "Permission denied" }

    // 1. Get Active Session
    const { data: session } = await supabase
        .from('academic_sessions')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)
        .single()

    if (!session) return { success: false, error: "No active academic session found." }

    // 2. Get Fee Categories & Schedule
    const { data: schedule } = await supabase
        .from('fee_schedule')
        .select('class_id, amount, category:fee_categories(name)')
        .eq('tenant_id', profile.tenant_id)

    if (!schedule || schedule.length === 0) return { success: false, error: "Fee schedule is empty. Configure fees first." }

    // Group fees by class
    const feesByClass: Record<string, any[]> = {} // class_id -> [{ name, amount }]
    schedule.forEach((item: any) => {
        if (!feesByClass[item.class_id]) feesByClass[item.class_id] = []
        if (item.amount > 0) {
            feesByClass[item.class_id].push({
                description: item.category.name,
                amount: Number(item.amount)
            })
        }
    })

    // 3. Get Active Students (with Class)
    const { data: students } = await supabase
        .from('students')
        .select('id, class_id')
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'active') // Assuming active status column exists or we just take all

    if (!students || students.length === 0) return { success: false, error: "No active students found." }

    // 4. Generate Invoices
    const invoices = []
    let skipCount = 0

    for (const student of students) {
        if (!student.class_id || !feesByClass[student.class_id]) {
            skipCount++
            continue
        }

        const items = feesByClass[student.class_id]
        const total = items.reduce((sum, item) => sum + item.amount, 0)

        invoices.push({
            tenant_id: profile.tenant_id,
            student_id: student.id,
            term: `${session.session} ${session.term}`,
            amount: total,
            status: 'pending',
            items: items // JSONB Array
        })
    }

    if (invoices.length === 0) return { success: false, error: "No invoices generated. Check student classes and fee configuration." }

    // Batch Insert (Chunking if large, but assuming < 1000 for now or Supabase handles reasonably sized batches)
    const { error } = await supabase.from('invoices').insert(invoices)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/${domain}/dashboard`)
    return { success: true, count: invoices.length, skipped: skipCount }
}

// --- Bursar Dashboard Stats ---

export async function getBursarStats() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'bursar'].includes(profile.role)) return null

    const tenantId = profile.tenant_id

    // 1. Fetch Invoices for expected revenue (all time or current session?)
    // Prompt says "current term". We need the active session term.
    const { data: session } = await supabase
        .from('academic_sessions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single()

    const termLabel = session ? `${session.session} ${session.term}` : null

    let invoiceQuery = supabase.from('invoices').select('amount, amount_paid').eq('tenant_id', tenantId)
    if (termLabel) invoiceQuery = invoiceQuery.eq('term', termLabel)

    const { data: invoices } = await invoiceQuery

    const totalExpected = (invoices || []).reduce((sum, inv) => sum + Number(inv.amount), 0)
    const totalCollected = (invoices || []).reduce((sum, inv) => sum + Number(inv.amount_paid), 0)
    const outstanding = totalExpected - totalCollected
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0

    // 2. Fetch Recent Transactions
    const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            method,
            date,
            reference,
            students (full_name)
        `)
        .eq('tenant_id', tenantId)
        .order('date', { ascending: false })
        .limit(5)

    // 3. Fetch Daily Collections (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: dailyData } = await supabase
        .from('transactions')
        .select('amount, date')
        .eq('tenant_id', tenantId)
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date', { ascending: true })

    // Group by date for the chart
    const dailyCollections: Record<string, number> = {}
    dailyData?.forEach(trx => {
        const d = new Date(trx.date).toISOString().split('T')[0]
        dailyCollections[d] = (dailyCollections[d] || 0) + Number(trx.amount)
    })

    const chartData = Object.entries(dailyCollections).map(([date, amount]) => ({
        date,
        amount
    })).slice(-30)

    return {
        metrics: {
            totalExpected,
            totalCollected,
            outstanding,
            collectionRate
        },
        recentTransactions: recentTransactions || [],
        chartData,
        term: termLabel || "N/A"
    }
}

export async function recordManualPayment(data: {
    studentId: string,
    invoiceId: string,
    amount: number,
    method: string,
    reference?: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!['admin', 'bursar'].includes(profile?.role)) return { success: false, error: "Permission denied" }

    const tenantId = profile.tenant_id

    // 1. Record Transaction
    const { error: trxError } = await supabase.from('transactions').insert({
        tenant_id: tenantId,
        invoice_id: data.invoiceId,
        student_id: data.studentId,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        status: 'success',
        date: new Date().toISOString()
    })

    if (trxError) return { success: false, error: trxError.message }

    // 2. Update Invoice amount_paid
    const { data: invoice } = await supabase.from('invoices').select('amount, amount_paid').eq('id', data.invoiceId).single()
    if (invoice) {
        const newPaid = Number(invoice.amount_paid) + Number(data.amount)
        const isPaid = newPaid >= Number(invoice.amount)

        await supabase.from('invoices').update({
            amount_paid: newPaid,
            status: isPaid ? 'paid' : 'partial'
        }).eq('id', data.invoiceId)
    }

    revalidatePath(`/dashboard/bursar`)
    return { success: true }
}
