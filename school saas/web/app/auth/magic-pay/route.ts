import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const token = requestUrl.searchParams.get('token')
    const supabase = createServerClient() // Standard client for DB check

    if (!token) {
        return new NextResponse("Missing Token", { status: 400 })
    }

    // 1. Validate Custom Token from our DB
    const { data: link, error } = await supabase
        .from('magic_links')
        .select('*')
        .eq('token', token)
        .single()

    if (error || !link) {
        return new NextResponse("Invalid or Expired Link", { status: 403 })
    }

    const now = new Date()
    if (new Date(link.expires_at) < now) {
        return new NextResponse("Link has expired", { status: 403 })
    }

    // 2. Exchange for Supabase Session (True Auto-Login)
    // We need the Service Role Key to generate a link on behalf of the user
    // If missing, we fallback to just redirecting (User might need to login manually)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (serviceRoleKey) {
        try {
            // Create Admin Client
            const adminAuth = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                serviceRoleKey,
                { auth: { autoRefreshToken: false, persistSession: false } }
            )

            // Generate a valid Supabase Magic Link
            // This link will set the cookie and then redirect to the 'redirectTo'
            const { data: linkData, error: linkError } = await adminAuth.auth.admin.generateLink({
                type: 'magiclink',
                email: link.user_email,
                options: {
                    redirectTo: `${requestUrl.origin}${link.redirect_path}`
                }
            })

            if (!linkError && linkData && linkData.properties?.action_link) {
                // Success! Redirect user to the Supabase Action Link
                // Mark our token as used (optional, or allow multi-use)
                // await supabase.from('magic_links').update({ used: true }).eq('token', token)

                return NextResponse.redirect(linkData.properties.action_link)
            } else {
                console.error("Failed to generate Supabase link:", linkError)
            }
        } catch (e) {
            console.error("Admin Auth Error:", e)
        }
    } else {
        console.warn("Missing SUPABASE_SERVICE_ROLE_KEY. Cannot auto-login. Redirecting to login.")
        // Fallback: Redirect to Login with specific next param
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('next', link.redirect_path)
        loginUrl.searchParams.set('email', link.user_email)
        return NextResponse.redirect(loginUrl)
    }

    // Fallback if Admin generation failed but key existed
    return NextResponse.redirect(new URL(link.redirect_path, request.url))
}
