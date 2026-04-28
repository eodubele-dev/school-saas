
import { NextRequest, NextResponse } from 'next/server'
import { verifyPaystackTransaction } from '@/lib/actions/paystack'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference')
    const trxref = searchParams.get('trxref') 

    const ref = reference || trxref

    if (!ref) {
        return NextResponse.json({ error: 'No reference provided' }, { status: 400 })
    }

    const verification = await verifyPaystackTransaction(ref)

    if (verification.success) {
        const metadata = verification.metadata as any
        const subdomain = metadata?.subdomain
        
        // Construct the redirect URL
        // If we are in local dev, we might be on localhost:3000
        // In production, we assume [subdomain].eduflow.ng
        const host = request.headers.get('host') || 'eduflow.ng'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        
        let redirectUrl = `${protocol}://${host}/dashboard/billing/family`
        
        if (metadata?.type === 'wallet_topup') {
            // Admin wallet topup redirect
            if (host.includes('localhost')) {
                redirectUrl = `${protocol}://${host}/${subdomain}/dashboard/admin`
            } else {
                redirectUrl = `${protocol}://${subdomain}.${host.replace(/^[a-z0-9-]+\./i, '')}/dashboard/admin`
            }
        } else {
            // Normal student billing redirect
            if (host.includes('localhost') && subdomain) {
                 redirectUrl = `${protocol}://${host}/${subdomain}/dashboard/billing/family`
            } else if (subdomain && !host.startsWith(subdomain + '.')) {
                 const baseDomain = host.replace(/^[a-z0-9-]+\./i, '')
                 redirectUrl = `${protocol}://${subdomain}.${baseDomain}/dashboard/billing/family`
            }
        }

        return NextResponse.redirect(new URL(redirectUrl))
    }

    return NextResponse.json({ error: 'Payment verification failed', details: verification }, { status: 400 })
}
