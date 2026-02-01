import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
    console.log("Starting Auth Debug/Fix...")
    const supabase = createAdminClient()

    const email = 'student@demo-school.com'
    const password = 'password123'
    const tenantSlug = 'demo-school'

    // 1. Check if user exists (Fetch up to 1000 to be safe)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })

    if (listError) return NextResponse.json({ error: "List Users Failed: " + listError.message }, { status: 500 })

    const existingUser = users.find(u => u.email === email)

    let userId = existingUser?.id

    if (existingUser) {
        console.log(`User ${email} exists. Updating password...`)
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, email_confirm: true }
        )
        if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    } else {
        console.log(`User ${email} not found. Creating...`)
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Emma Johnson' }
        })
        if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })
        userId = newUser.user.id
    }

    // 2. Ensure Tenant Exists
    let { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single()

    if (!tenant) {
        // Create Tenant if missing
        const { data: newTenant, error: tenantError } = await supabase.from('tenants').insert({
            name: 'Demo School',
            slug: tenantSlug,
            domain: 'demo-school.localhost'
        }).select().single()

        if (tenantError) return NextResponse.json({ error: "Tenant create failed: " + tenantError.message }, { status: 500 })
        tenant = newTenant
    }

    // 3. Ensure Profile Exists & Linked correctly
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        tenant_id: tenant.id,
        full_name: 'Emma Johnson',
        role: 'student'
    })

    if (profileError) return NextResponse.json({ error: "Profile Upsert Failed: " + profileError.message }, { status: 500 })

    return NextResponse.json({
        success: true,
        message: `User ${email} fixed. Password set to ${password}`,
        user_id: userId,
        tenant_id: tenant.id
    })
}
