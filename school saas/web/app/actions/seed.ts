'use server'

import { createClient } from '@supabase/supabase-js'

export async function seedTestUsers() {
    console.log("[Seed] Starting seed process...")

    try {
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!serviceRoleKey) {
            console.error("[Seed] Missing SUPABASE_SERVICE_ROLE_KEY")
            return { error: "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables." }
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Get the first tenant (School 1)
        console.log("[Seed] Fetching tenant...")
        const { data: tenant, error: tenantError } = await supabaseAdmin.from('tenants').select('*').limit(1).single()

        if (tenantError) {
            console.error("[Seed] Tenant fetch error:", tenantError)
            return { error: `Database Error (Tenants): ${tenantError.message}` }
        }

        if (!tenant) {
            return { error: "No school/tenant found. Please create a school first via the Supabase dashboard or ensuring migrations ran." }
        }

        const schoolId = tenant.id
        const results = []

        // 2. Define Users
        const users = [
            { email: 'admin@school1.com', password: 'password123', role: 'admin', name: "Admin Principal" },
            { email: 'teacher@school1.com', password: 'password123', role: 'teacher', name: "Teacher Sarah" },
            { email: 'parent@school1.com', password: 'password123', role: 'parent', name: "Parent John" },
        ]

        for (const u of users) {
            console.log(`[Seed] Processing user: ${u.email}`)

            // A. Create User with Admin API (Bypasses email verification)
            // We use admin.createUser to force email confirmation
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { full_name: u.name, role: u.role, school_slug: tenant.slug }
            })

            if (authError) {
                console.log(`[Seed] User ${u.email} creation failed (likely exists):`, authError.message)

                // If creation fails, we assume they exist. We try to update their profile/metadata.
                // Since we have the service role, we can get the user ID by email via listUsers (filtering manually if needed) or just signIn.
                // Using signIn is reliable for getting the ID quickly.
                const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
                    email: u.email,
                    password: u.password
                })

                if (signInData.user) {
                    await upsertProfile(supabaseAdmin, signInData.user.id, schoolId, u.role, u.name)
                    results.push({ ...u, status: 'Updated' })
                } else {
                    console.error(`[Seed] Could not sign in existing user ${u.email}:`, signInError)
                    results.push({ ...u, status: 'Failed: Use correct password' })
                }

            } else if (authData.user) {
                // New User Created
                await upsertProfile(supabaseAdmin, authData.user.id, schoolId, u.role, u.name)
                results.push({ ...u, status: 'Created & Confirmed' })
            }
        }

        return { success: true, users: results, tenantSlug: tenant.slug }

    } catch (err: any) {
        console.error("[Seed] Unexpected error:", err)
        return { error: `Unexpected Error: ${err.message}` }
    }
}

async function upsertProfile(supabase: any, userId: string, schoolId: string, role: string, name: string) {
    try {
        console.log(`[Seed] Upserting profile for ${userId} (${role})`)
        const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).single()

        const profileData = {
            id: userId,
            school_id: schoolId,
            role: role,
            full_name: name
            // Removed email from profile update to avoid constraints unless schema requires it
        }

        if (existing) {
            const { error } = await supabase.from('profiles').update({ role, school_id: schoolId }).eq('id', userId)
            if (error) console.error(`[Seed] Profile update error:`, error)
        } else {
            const { error } = await supabase.from('profiles').insert(profileData)
            if (error) console.error(`[Seed] Profile insert error:`, error)
        }
    } catch (e) {
        console.error(`[Seed] Profile upsert exception:`, e)
    }
}
