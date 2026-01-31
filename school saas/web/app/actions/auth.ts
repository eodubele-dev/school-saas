'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// Note: In a real production app, use useFormState for better error handling.
// For now, we redirect with query params to handle errors simply.

export async function login(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const domain = formData.get('domain') as string // Context: "school1"

    // 1. Authenticate User Credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (authError || !authData.user) {
        // preserve domain context in URL on error
        const redirectUrl = domain ? `/${domain}/login` : '/login'
        const errorMessage = authError?.message || "Authentication failed"
        redirect(`${redirectUrl}?error=${encodeURIComponent(errorMessage)}`)
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
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('school_id, role')
                .eq('id', authData.user.id)
                .single()

            if (profileError || !profile) {
                throw new Error("Profile not found")
            }

            if (profile.school_id !== tenant.id) {
                // Critical: User belongs to School A but tried to log in to School B
                await supabase.auth.signOut() // Kill the session immediately
                throw new Error(`Access Denied. You are not a member of ${domain}.`)
            }

            // C. Update User Metadata with Role for Middleware RBAC
            await supabase.auth.updateUser({
                data: {
                    role: profile.role,
                    school_slug: domain
                }
            })

        } catch (error: any) {
            // Rollback: Sign out and redirect with error
            await supabase.auth.signOut()
            redirect(`/${domain}/login?error=${encodeURIComponent(error.message)}`)
        }
    }

    // 3. Success Redirect
    // If context was valid, simply refresh and go to dashboard
    revalidatePath('/', 'layout')
    redirect('/')
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
