
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

    // Use admin client (true) for verification to bypass RLS issues during redirects
    const verification = await verifyPaystackTransaction(ref, true)

    if (verification.success) {
        const metadata = verification.metadata as any
        const subdomain = metadata?.subdomain
        
        // Construct the redirect path
        let targetPath = '/dashboard/billing/family'
        
        if (metadata?.type === 'wallet_topup') {
            targetPath = '/dashboard/admin'
        }
        
        // Handle path-based routing for local development
        const host = request.headers.get('host') || ''
        if (host.includes('localhost') && subdomain) {
            targetPath = `/${subdomain}${targetPath}`
        }

        return NextResponse.redirect(new URL(targetPath, request.url))
    }

    return NextResponse.json({ error: 'Payment verification failed', details: verification }, { status: 400 })
}
