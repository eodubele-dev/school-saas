
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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function createSchool1Users() {
    console.log("🚀 Creating Users for 'school1.com'...")

    // 1. Get School1 Tenant
    const { data: tenant } = await supabase.from('tenants').select('id, name').eq('slug', 'school1').single()

    if (!tenant) {
        console.error("❌ School1 Tenant not found!")
        return
    }
    console.log(`✅ Tenant: ${tenant.name} (${tenant.id})`)

    const users = [
        { email: 'student@school1.com', role: 'student' },
        { email: 'bursar@school1.com', role: 'bursar' }
    ]

    for (const u of users) {
        // A. Cleanup Existing (to be safe)
        const { data: { users: list } } = await supabase.auth.admin.listUsers()
        const existing = list.find(e => e.email === u.email)

        if (existing) {
            console.log(`⚠️  Deleting existing user ${u.email}...`)
            await supabase.auth.admin.deleteUser(existing.id)
        }

        // B. Create Auth User
        const { data: newUser, error } = await supabase.auth.admin.createUser({
            email: u.email,
            password: 'password123',
            email_confirm: true,
            user_metadata: { full_name: `School1 ${u.role}`, role: u.role } // Store role in metadata too
        })

        if (error) {
            console.error(`❌ Failed creation for ${u.email}: ${error.message}`)
            continue
        }

        console.log(`✅ Auth User Created: ${u.email} (${newUser.user.id})`)

        // C. Create Profile (WITHOUT EMAIL COLUMN)
        // Check if profile exists first (it shouldn't if we deleted user, but CASCADE might have handled it)

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                tenant_id: tenant.id,
                role: u.role,
                full_name: `School1 ${u.role}`
                // NO EMAIL COLUMN HERE based on schema
            }, { onConflict: 'id' })

        if (profileError) console.error(`❌ Profile Error: ${profileError.message}`)
        else console.log(`✅ Profile Linked to ${tenant.name}`)
    }
}

createSchool1Users()
