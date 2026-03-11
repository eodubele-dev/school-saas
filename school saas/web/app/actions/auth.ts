'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '@/lib/supabase/server'

// Note: In a real production app, use useFormState for better error handling.
// For now, we redirect with query params to handle errors simply.

export async function login(formData: FormData) {
    const supabase = createClient()

    let email = formData.get('email') as string
    const password = formData.get('password') as string
    const domain = formData.get('domain') as string // Context: "school1"

    console.log(`[Auth Action] Login attempt for: ${email} on domain: ${domain}`)

    // 0. Resolve Identifier (Phone or Admission Number) to Email
    // Rules: 
    // - If it looks like a phone (starts with 0 or 234 and is numeric)
    // - If it looks like an admission number (contains / or -)
    const isEmail = email.includes('@')
    const isPhone = /^\d+$/.test(email.replace(/\+/g, '')) && (email.length >= 10)

    if (!isEmail) {
        const supabaseAdmin = createClient() // We'll use a service role or admin client if needed, but profiles are generally readable or we use a dedicated action

        if (isPhone) {
            // Resolve Parent Phone to Email
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('email')
                .eq('phone', email)
                .eq('role', 'parent')
                .single()

            if (profile?.email) {
                email = profile.email
            } else {
                // Try with leading 0 or 234 normalization if needed
                const altPhone = email.startsWith('0') ? '234' + email.substring(1) : '0' + email.substring(3)
                const { data: profileAlt } = await supabaseAdmin
                    .from('profiles')
                    .select('email')
                    .eq('phone', altPhone)
                    .eq('role', 'parent')
                    .single()
                if (profileAlt?.email) email = profileAlt.email
            }
        } else {
            // Resolve Student Admission Number to Email
            // Students use dummy emails: student_[adm_no]@eduflow.local
            // Sanitize adm no for email (replace / with _)
            const sanitizedAdm = email.replace(/\//g, '_').toLowerCase()
            email = `student_${sanitizedAdm}@eduflow.local`
        }
    }

    // 1. Authenticate User Credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    console.log(`[Auth Action] Auth result: User=${authData.user?.id}, Error=${authError?.message}`)

    if (authError || !authData.user) {
        return { error: authError?.message || "Authentication failed" }
    }

    // 2. Context Verification (Only if logging in via a domain)
    if (domain) {
        try {
            // A. Get School ID from Slug
            const { data: tenant, error: tenantError } = await supabase
                .from('tenants')
                .select('id, slug')
                .eq('slug', domain)
                .single()

            if (tenantError || !tenant) {
                throw new Error("Invalid School Domain")
            }

            // B. Verify User Profile is linked to this School
            console.log(`[Auth Action] Querying profile for user: ${authData.user.id}`)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('tenant_id, role')
                .eq('id', authData.user.id)
                .single()

            console.log(`[Auth Action] Profile query result:`, { profile, profileError })

            if (profileError || !profile) {
                console.error(`[Auth Action] Profile error:`, profileError)
                throw new Error(profileError?.message || "Profile not found")
            }

            if (profile.tenant_id !== tenant.id) {
                // Critical: User belongs to School A but tried to log in to School B
                await supabase.auth.signOut() // Kill the session immediately
                throw new Error(`Access Denied. You are not a member of ${domain}.`)
            }

            // C. Update User Metadata with Role for Middleware RBAC
            const { data: { user: updatedUser }, error: updateError } = await supabase.auth.updateUser({
                data: {
                    role: profile.role,
                    school_slug: domain
                }
            })

            if (updatedUser) {
                authData.user = updatedUser
            }

        } catch (error: any) {
            // Rollback: Sign out and return error
            await supabase.auth.signOut()
            return { error: error.message }
        }
    }

    console.log("[Auth Action] Context verification passed (or skipped if no domain)")

    // 3. Success
    console.log(`[Login Action Success] User: ${authData.user?.email}, Domain: ${domain}, Role: ${authData.user?.user_metadata?.role}`)

    revalidatePath('/', 'layout')

    return { success: true }
}

export async function signInWithMagicLink(formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string
    const domain = formData.get('domain') as string
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://eduflow.ng' // Fallback

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                domain_context: domain // Pass domain to callback for verification if needed
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: "Check your email for the magic link!" }
}

export async function signup(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        }
    })

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
