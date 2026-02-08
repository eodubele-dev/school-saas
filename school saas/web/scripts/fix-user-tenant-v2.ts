
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) return {}
    const content = fs.readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) env[match[1]] = match[2].replace(/"/g, '').trim()
    })
    return env
}

const env = loadEnv()
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Missing Credentials")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function fixTenantLinkage() {
    console.log("🔍 Checking School1 Tenant...")
    const { data: tenant, error } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('slug', 'school1')
        .single()

    if (error || !tenant) {
        console.error("❌ Tenant 'school1' NOT FOUND!", error?.message)
        return
    }

    console.log(`✅ Target Tenant: ${tenant.name} (${tenant.id})`)

    const usersToFix = [
        { email: 'student@test.com', role: 'student' },
        { email: 'bursar@test.com', role: 'bursar' }
    ]

    for (const u of usersToFix) {
        // 1. Get User ID from Auth (Admin API)
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        const user = users?.find(user => user.email === u.email)

        if (!user) {
            console.log(`⚠️  Auth User not found for ${u.email}. Creating...`)
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: u.email,
                password: 'password123',
                email_confirm: true,
                user_metadata: { full_name: `Test ${u.role}`, role: u.role }
            })
            if (createError) {
                console.error(`❌ Failed to create user: ${createError.message}`)
                continue
            }
            console.log(`✅ Created ${u.email} (${newUser.user.id})`)
            // Create Profile immediately
            await supabase.from('profiles').insert({
                id: newUser.user.id,
                email: u.email,
                role: u.role,
                tenant_id: tenant.id,
                full_name: `Test ${u.role}`
            })
            continue
        }

        console.log(`👤 Found Auth User: ${u.email} (${user.id})`)

        // 2. Update Profile to point to 'school1'
        // First check if profile exists
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

        if (profile) {
            if (profile.tenant_id !== tenant.id) {
                console.log(`🔄 Moving from ${profile.tenant_id} to ${tenant.id}...`)
                await supabase.from('profiles').update({ tenant_id: tenant.id }).eq('id', user.id)
                console.log(`✅ Moved.`)
            } else {
                console.log(`✅ Already correct.`)
            }
        } else {
            console.log(`⚠️  Profile missing. Creating...`)
            await supabase.from('profiles').insert({
                id: user.id,
                email: u.email,
                role: u.role,
                tenant_id: tenant.id,
                full_name: `Test ${u.role}`
            })
            console.log(`✅ Profile created.`)
        }
    }
}

fixTenantLinkage()
