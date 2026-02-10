
import { NextRequest, NextResponse } from 'next/server'
import { verifyPaystackTransaction } from '@/lib/actions/paystack'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference')
    const trxref = searchParams.get('trxref') // Paystack sends both sometimes

    const ref = reference || trxref

    if (!ref) {
        return NextResponse.json({ error: 'No reference provided' }, { status: 400 })
    }

    const verification = await verifyPaystackTransaction(ref)

    if (verification.success) {
        // Redirect to a success page or dashboard
        // We could use metadata to know where to redirect, but for now, default to dashboard or a specific success page
        // Ideally, metadata would contain a return_url
        // Let's redirect to a generic success page on the main domain?
        // Or if we can parse the domain from the request... 
        // For now, let's redirect to `/dashboard` of the tenant.
        // We don't easily know the domain here without metadata lookup or session.
        // But `verifyPaystackTransaction` updates the transaction.

        // Let's redirect to a "payment-success" page at root for now, or use the referer if possible?
        // Better: redirect to `/payment/success?reference=${ref}` which can then redirect to the proper tenant dashboard if it knows it.
        // Even better: The student/parent likely initiated this.

        return NextResponse.redirect(new URL(`/success?reference=${ref}`, request.url))
    }

    return NextResponse.json({ error: 'Payment verification failed', details: verification }, { status: 400 })
}
