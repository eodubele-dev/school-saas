'use server'

import { createClient } from '@/lib/supabase/server'
import { safeParseJSON } from '@/lib/utils'
import { redirect } from 'next/navigation'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

export async function initializePaystackTransaction(transactionId: string) {
    const supabase = createClient()

    // 1. Get Transaction Details
    const { data: trx } = await supabase
        .from('transactions')
        .select('*, student:students(email, full_name)')
        .eq('id', transactionId)
        .single()

    if (!trx) return { success: false, error: "Transaction not found" }

    // 2. Prepare Paystack Payload
    const email = trx.student?.email || 'bursar@school.com' // Fallback
    const amountInKobo = Math.round(trx.amount * 100)
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                amount: amountInKobo,
                reference: trx.reference || trx.id,
                callback_url: callbackUrl,
                metadata: {
                    transaction_id: trx.id,
                    student_name: trx.student?.full_name,
                    custom_fields: [
                        { display_name: "Student", variable_name: "student", value: trx.student?.full_name }
                    ]
                }
            }),
            signal: controller.signal
        })

        const data = await safeParseJSON(response)

        if (!response.ok || !data.status) {
            return { success: false, error: data.message || "Initialization failed" }
        }

        return { success: true, url: data.data.authorization_url, access_code: data.data.access_code }

    } catch (error: any) {
        if (error.name === 'AbortError') {
            return { success: false, error: "Payment initialization timed out" }
        }
        console.error("Paystack Init Error:", error)
        return { success: false, error: "Network error during initialization" }
    } finally {
        clearTimeout(timeout)
    }
}

export async function verifyPaystackTransaction(reference: string) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
            },
            signal: controller.signal
        })

        const data = await safeParseJSON(response)

        if (!response.ok || !data.status) return { success: false, error: data.message || "Verification failed" }

        if (data.data.status === 'success') {
            // Update Database
            const supabase = createClient()

            // Get transaction by reference
            const { data: trx } = await supabase.from('transactions').select('*').eq('reference', reference).single()

            if (trx && trx.status !== 'success') {
                await supabase.from('transactions').update({
                    status: 'success',
                    paystack_metadata: data.data,
                    method: 'paystack'
                }).eq('id', trx.id)

                // Update Invoice
                if (trx.invoice_id) {
                    const { data: invoice } = await supabase.from('invoices').select('*').eq('id', trx.invoice_id).single()
                    if (invoice) {
                        const newPaid = Number(invoice.amount_paid) + (data.data.amount / 100)
                        const isPaid = newPaid >= Number(invoice.amount)
                        await supabase.from('invoices').update({
                            amount_paid: newPaid,
                            status: isPaid ? 'paid' : 'partial'
                        }).eq('id', trx.invoice_id)
                    }
                }
            }
            return { success: true, data: data.data }
        }

        return { success: false, status: data.data.status }

    } catch (error: any) {
        if (error.name === 'AbortError') {
            return { success: false, error: "Verification timed out" }
        }
        return { success: false, error: "Network error during verification" }
    } finally {
        clearTimeout(timeout)
    }
}

export async function initiatePayment(data: {
    amount: number,
    email: string,
    studentId?: string,
    invoiceId?: string,
    reference?: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const tenantId = user?.user_metadata?.tenant_id

    if (!tenantId) {
        // Fallback: fetch from profile
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()
        if (!profile) return { success: false, error: "Tenant not found" }
        // Use profile tenant
    }

    // 1. Create Transaction Record
    const { data: trx, error } = await supabase.from('transactions').insert({
        tenant_id: tenantId || (await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()).data?.tenant_id,
        student_id: data.studentId,
        invoice_id: data.invoiceId,
        amount: data.amount,
        method: 'paystack',
        reference: data.reference || `PAY-${Date.now()}`,
        status: 'pending',
        paystack_metadata: { initiated_via: 'web' }
    }).select().single()

    if (error || !trx) return { success: false, error: "Failed to create transaction record: " + error?.message }

    // 2. Initialize Paystack
    return await initializePaystackTransaction(trx.id)
}
