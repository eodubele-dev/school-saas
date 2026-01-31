import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    // origin should be the site that initiated the request
    const origin = requestUrl.origin

    if (code) {
        const supabase = createClient()

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Get the user to check their profile and school association
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Fetch the user's profile to get the school_slug / tenant mapping
                // Assuming 'profiles' table has 'school_id' and we need to look up 'tenants' table

                const { data: profile } = await supabase
                    .from('profiles')
                    .select(`
                school_id,
                tenants:school_id (
                    slug
                )
            `)
                    .eq('id', user.id)
                    .single()

                if (profile && profile.tenants) {
                    // Redirect to the correct subdomain dashboard
                    // @ts-ignore - Supabase type inference might differ slightly
                    const slug = profile.tenants.slug

                    // Construct the absolute URL for the subdomain
                    // Use process.env.NEXT_PUBLIC_ROOT_DOMAIN or similar if available, otherwise assume eduflow.ng structure
                    // For local dev, we need to handle localhost ports differently, but for now assuming standard structure

                    const protocol = requestUrl.protocol
                    const host = requestUrl.host // e.g. localhost:3000 or app.eduflow.ng

                    // If we are on localhost, we might need to handle port. 
                    // Ideally we redirect to `slug.localhost:3000` or `slug.eduflow.ng`

                    let redirectDomain = host

                    if (host.includes('localhost')) {
                        // Replace main domain part or prepend if missing
                        // This is tricky without knowing exact dev setup (ports etc), but usually:
                        // We want `http://school1.localhost:3000/dashboard`

                        // If host is `localhost:3000`, new host is `slug.localhost:3000`
                        if (!host.startsWith(slug + '.')) {
                            // Check if we are already on a subdomain or root
                            const baseDomain = 'localhost:3000' // hardcoded for dev simplicity now, should be env var
                            redirectDomain = `${slug}.${baseDomain}`
                        }
                    } else {
                        // Production logic
                        const baseDomain = 'eduflow.ng' // hardcoded or env
                        redirectDomain = `${slug}.${baseDomain}`
                    }

                    return NextResponse.redirect(`${protocol}//${redirectDomain}/dashboard`)
                }
            }
        }
    }

    // Auth failed or no code, return to landing page
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
