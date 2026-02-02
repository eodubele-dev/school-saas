import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
    console.log("Starting Auth Debug/Fix...")
    const supabase = createAdminClient()

    const email = 'student@demo-school.com'
    const password = 'password123'
    const tenantSlug = 'demo-school'

    try {
        // 1. Find Existing User
        console.log(`Looking for existing user: ${email}`)
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
            perPage: 1000
        })

        if (listError) throw new Error(`List Users Failed: ${listError.message}`)

        const targetUser = users.find(u => u.email === email)

        if (!targetUser) {
            return NextResponse.json({
                error: "User not found (Admin API)",
                message: `The Admin API cannot find the user, but you confirmed SQL rows exist. This means your .env.local keys imply a DIFFERENT project than your SQL Editor.`,
                debug_info: {
                    connected_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
                    project_ref: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('.')[0]?.split('//')[1],
                    instructions: "Check if the 'project_ref' above matches the URL in your Supabase Dashboard."
                }
            }, { status: 404 })
        }

        const userId = targetUser.id
        console.log(`User found (ID: ${userId}). Resetting password...`)

        // 2. Reset Password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            { password: password, email_confirm: true }
        )
        if (updateError) throw new Error(`Password Reset Failed: ${updateError.message}`)

        // 3. Verify Tenant
        console.log(`Checking for tenant: ${tenantSlug}`)
        const { data: tenant, error: tFetchError } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single()

        if (tFetchError && tFetchError.code !== 'PGRST116') {
            throw new Error(`Tenant Fetch Error: ${tFetchError.message}`)
        }

        if (!tenant) {
            return NextResponse.json({
                error: "Tenant not found",
                message: `Tenant '${tenantSlug}' does not exist. Please run complete_setup.sql first.`
            }, { status: 404 })
        }

        // 4. Sync Profile
        console.log(`Syncing profile for User: ${userId}`)
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            tenant_id: tenant.id,
            full_name: 'Emma Johnson',
            role: 'student'
        })

        if (profileError) throw new Error(`Profile Upsert Failed: ${profileError.message}`)
        console.log("Profile synced successfully.")

        return NextResponse.json({
            success: true,
            message: `✅ Password reset successful for ${email}`,
            credentials: {
                email,
                password,
                loginUrl: `http://demo-school.localhost:3000/demo-school/login`
            },
            userId,
            tenantId: tenant.id
        })

    } catch (err: any) {
        console.error("DEBUG-AUTH ERROR:", err.message)
        return NextResponse.json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 })
    }
}
