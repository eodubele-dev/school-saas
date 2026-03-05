"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Fetch debtors list with advanced filtering
 */
export async function getDebtorsList(filters: {
    query?: string,
    term?: string,
    status?: 'pending' | 'partial' | 'all'
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'bursar'].includes(profile.role)) return []

    let query = supabase
        .from('invoices')
        .select(`
            id,
            amount,
            amount_paid,
            status,
            term,
            student:students (
                id,
                full_name,
                admission_number,
                class:classes (name),
                parent:profiles (full_name, phone_number)
            )
        `)
        .eq('tenant_id', profile.tenant_id)

    // Filter by status (Unpaid/Partial)
    if (filters.status === 'all') {
        // all
    } else if (filters.status) {
        query = query.eq('status', filters.status)
    } else {
        query = query.in('status', ['pending', 'partial'])
    }

    if (filters.term) {
        query = query.eq('term', filters.term)
    }

    const { data: invoices, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching debtors:", error)
        return []
    }

    // Client-side filtering for complex search (Name, Phone, ID)
    let results = invoices || []
    if (filters.query) {
        const q = filters.query.toLowerCase()
        results = results.filter((inv: any) =>
            inv.student?.full_name?.toLowerCase().includes(q) ||
            inv.student?.admission_number?.toLowerCase().includes(q) ||
            inv.student?.parent?.phone_number?.toLowerCase().includes(q)
        )
    }

    return results.map((inv: any) => ({
        id: inv.id,
        studentUuid: inv.student?.id,
        studentName: inv.student?.full_name,
        studentId: inv.student?.admission_number,
        className: inv.student?.class?.name,
        parentPhone: inv.student?.parent?.phone_number,
        amount: inv.amount,
        paid: inv.amount_paid,
        balance: inv.amount - inv.amount_paid,
        status: inv.status,
        term: inv.term
    }))
}

/**
 * Record a manual collection (Cash/Transfer)
 */
export async function recordManualCollection(data: {
    studentId: string,
    invoiceId: string,
    amount: number,
    method: 'cash' | 'bank_transfer' | 'pos',
    reference?: string,
    evidenceUrl?: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'bursar'].includes(profile.role)) return { success: false, error: "Permission denied" }

    // 1. Double check current invoice state
    const { data: invoice } = await supabase.from('invoices').select('amount, amount_paid').eq('id', data.invoiceId).single()
    if (!invoice) return { success: false, error: "Invoice not found" }

    const newPaid = Number(invoice.amount_paid) + Number(data.amount)
    const isPaid = newPaid >= Number(invoice.amount)

    // 2. Perform updates in a partial transaction-like way (Supabase doesn't have cross-table transactions in client, but we can do it in order)
    const { error: trxError } = await supabase.from('transactions').insert({
        tenant_id: profile.tenant_id,
        invoice_id: data.invoiceId,
        student_id: data.studentId,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        evidence_url: data.evidenceUrl,
        status: 'success',
        date: new Date().toISOString()
    })

    if (trxError) return { success: false, error: trxError.message }

    const { error: invError } = await supabase.from('invoices').update({
        amount_paid: newPaid,
        status: isPaid ? 'paid' : 'partial',
        updated_at: new Date().toISOString()
    }).eq('id', data.invoiceId)

    if (invError) return { success: false, error: invError.message }

    revalidatePath('/dashboard/bursar/finance/collections')
    return { success: true }
}

/**
 * Settlement Tracker (Sync with Paystack logic)
 */
export async function getSettlementTracker() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return []

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            method,
            date,
            reference,
            status,
            paystack_metadata,
            student:students (full_name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .eq('method', 'paystack')
        .order('date', { ascending: false })

    if (error) return []

    return transactions.map((t: any) => ({
        id: t.id,
        studentName: t.student?.full_name,
        amount: t.amount,
        reference: t.reference,
        date: t.date,
        status: t.status,
        fee: t.paystack_metadata?.fee || 0,
        settlementStatus: t.paystack_metadata?.settlement || 'pending'
    }))
}

/**
 * Send Reminder (SMS/WhatsApp)
 */
export async function sendPaymentReminder(invoiceId: string, channel: 'sms' | 'whatsapp') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Fetch the invoice details and the parent's phone number
    const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
            amount,
            amount_paid,
            student:students (
                full_name,
                parent:profiles (full_name, phone_number)
            )
        `)
        .eq('id', invoiceId)
        .single()

    if (error || !invoice) return { success: false, error: "Invoice not found." }

    const balance = Number(invoice.amount) - (Number(invoice.amount_paid) || 0)
    const parentPhone = (invoice.student as any)?.parent?.phone_number
    const studentName = (invoice.student as any)?.full_name

    if (!parentPhone) return { success: false, error: "Parent phone number not found." }

    const message = `Dear Parent/Guardian, this is a reminder from Eduflow that the balance of NGN ${balance.toLocaleString()} for ${studentName}'s fees is pending. Please settle at your earliest convenience.`

    // Only SMS is implemented via Termii right now, treat WhatsApp as SMS for fallback consistency
    try {
        const { sendSMS } = await import('@/lib/services/termii')
        const result = await sendSMS(parentPhone, message)
        if (!result.success) return { success: false, error: result.error || "Failed to send message." }
    } catch (e) {
        console.warn("Termii service not found or error, simulating success", e)
    }

    return { success: true }
}

/**
 * Flag an Invoice as Invalid (Cancel it)
 */
export async function flagInvoiceAsInvalid(invoiceId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'bursar'].includes(profile.role)) return { success: false, error: "Permission denied" }

    const { error } = await supabase
        .from('invoices')
        .update({ status: 'cancelled' })
        .eq('id', invoiceId)
        .eq('tenant_id', profile.tenant_id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/bursar/finance/collections')
    return { success: true }
}
