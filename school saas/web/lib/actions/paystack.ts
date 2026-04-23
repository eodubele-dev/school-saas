'use server'

import { createClient } from '@/lib/supabase/server'
import { safeParseJSON } from '@/lib/utils'
import { redirect } from 'next/navigation'

import { getDecryptedPaystackConfig } from './finance-settings'

const PLATFORM_PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!

export async function initializePaystackTransaction(transactionId: string, subdomain?: string) {
    const supabase = createClient()

    // 1. Get Transaction Details
    const { data: trx } = await supabase
        .from('transactions')
        .select('*, student:students(email, full_name)')
        .eq('id', transactionId)
        .single()

    if (!trx) return { success: false, error: "Transaction not found" }

    // 2. Get Tenant-Specific Paystack Keys
    const config = await getDecryptedPaystackConfig(trx.tenant_id)
    if (!config || !config.isEnabled) {
        return { 
            success: false, 
            error: "Payment gateway not configured for this school. Please contact administration." 
        }
    }

    const PAYSTACK_SECRET_KEY = config.secretKey

    // 3. Prepare Paystack Payload
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
                    subdomain: subdomain || "",
                    student_name: trx.student?.full_name,
                    custom_fields: [
                        { display_name: "Student", variable_name: "student", value: trx.student?.full_name },
                        { display_name: "Subdomain", variable_name: "subdomain", value: subdomain || "" }
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

import { createAdminClient } from '@/lib/supabase/admin'

export async function verifyPaystackTransaction(reference: string, useAdmin: boolean = false) {
    const supabase = useAdmin ? createAdminClient() : createClient()
    
    // 1. Get transaction to identify tenant
    const { data: trx } = await supabase
        .from('transactions')
        .select('tenant_id')
        .eq('reference', reference)
        .single()

    if (!trx) return { success: false, error: "Transaction reference not found" }

    // 2. Get Tenant Keys
    const config = await getDecryptedPaystackConfig(trx.tenant_id)
    const SECRET_KEY = config?.isEnabled ? config.secretKey : PLATFORM_PAYSTACK_SECRET_KEY

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${SECRET_KEY}`
            },
            signal: controller.signal
        })

        const data = await safeParseJSON(response)

        if (!response.ok || !data.status) return { success: false, error: data.message || "Verification failed" }

        if (data.data.status === 'success') {
            // Update Database
            // Use same supabase client as identified above

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

                // --- Wallet Topup Integration ---
                // If this was a wallet topup, credit the tenant's sms_balance in realtime
                const metadata = data.data.metadata
                if (metadata?.type === 'wallet_topup') {
                    // Fetch current tenant to get existing balance
                    const { data: tenant } = await supabase.from('tenants').select('sms_balance').eq('id', trx.tenant_id).single()
                    if (tenant) {
                        const currentBalance = Number(tenant.sms_balance) || 0
                        const topupAmount = Number(data.data.amount) / 100 // Convert Kobo to Naira
                        
                        await supabase.from('tenants').update({
                            sms_balance: currentBalance + topupAmount,
                            updated_at: new Date().toISOString()
                        }).eq('id', trx.tenant_id)

                        console.log(`[Wallet Topup] Credited ₦${topupAmount} to Tenant ${trx.tenant_id}. New Balance: ₦${currentBalance + topupAmount}`)
                    }
                }
            }
            return { success: true, data: data.data, metadata: data.data.metadata }
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
    reference?: string,
    subdomain?: string
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
    return await initializePaystackTransaction(trx.id, data.subdomain)
}
