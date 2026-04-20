import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getDecryptedPaystackConfig } from '@/lib/actions/finance-settings'
import { verifyPaystackTransaction } from '@/lib/actions/paystack'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
    const body = await request.json()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature provided' }, { status: 400 })
    }

    const { data: { reference } } = body
    if (!reference) {
        return NextResponse.json({ error: 'No reference in body' }, { status: 400 })
    }

    // 1. Identify Tenant from Reference
    const supabase = createAdminClient()
    
    // Find the transaction record to get the tenant_id
    const { data: trx, error: trxError } = await supabase
        .from('transactions')
        .select('tenant_id, status')
        .eq('reference', reference)
        .single()

    if (trxError || !trx) {
        console.error(`[Webhook Error] Transaction not found for reference: ${reference}`)
        // We return 200 to Paystack so they stop retrying, but log the error
        return NextResponse.json({ received: true }) 
    }

    // If already successful, ignore
    if (trx.status === 'success') {
        return NextResponse.json({ received: true })
    }

    // 2. Fetch and Decrypt Tenant Secret Key
    const config = await getDecryptedPaystackConfig(trx.tenant_id)
    if (!config || !config.secretKey) {
        console.error(`[Webhook Error] No valid Paystack config for tenant: ${trx.tenant_id}`)
        return NextResponse.json({ received: true })
    }

    // 3. Verify Signature
    const hash = crypto
        .createHmac('sha512', config.secretKey)
        .update(JSON.stringify(body))
        .digest('hex')

    if (hash !== signature) {
        console.error(`[Webhook Error] Invalid signature for reference: ${reference}`)
        // Possibly log this as a security event
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 4. Process Event
    // Paystack sends 'charge.success'
    if (body.event === 'charge.success') {
        console.log(`[Webhook success] Processing verified payment for ref: ${reference}`)
        await verifyPaystackTransaction(reference, true) // Pass true for useAdmin
    }

    return NextResponse.json({ received: true })
}
