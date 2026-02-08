
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Manual .env.local parser
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
        console.warn("⚠️ .env.local not found!")
        return {}
    }
    const content = fs.readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
            env[match[1]] = match[2].replace(/"/g, '').trim()
        }
    })
    return env
}

const env = loadEnv()
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function checkAndSeedUsers() {
    console.log("🚀 Checking Auth Users & Roles...")

    // 1. Get Tenant (for seeding if needed)
    const { data: tenants } = await supabase.from('tenants').select('id, name').limit(1)
    if (!tenants || tenants.length === 0) {
        console.error("❌ No tenants found. Cannot seed users.")
        return
    }
    const tenant = tenants[0]
    console.log(`ℹ️  Using Tenant: ${tenant.name} (${tenant.id})`)

    // 2. List All Auth Users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
        console.error("❌ Failed to list users:", authError)
        return
    }

    // 3. Get Profiles for these users
    const userIds = users.map(u => u.id)
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, tenant_id')
        .in('id', userIds)

    if (profileError) {
        console.error("❌ Failed to fetch profiles:", profileError)
        return
    }

    // 4. map profile data to users
    const userMap = users.map(u => {
        const profile = profiles?.find(p => p.id === u.id)
        return {
            email: u.email,
            id: u.id,
            role: profile?.role || 'MISSING_PROFILE',
            tenant: profile?.tenant_id || 'N/A'
        }
    })

    console.table(userMap)

    // 5. Check for missing test users
    const desiredUsers = [
        { email: 'student@test.com', role: 'student', password: 'password123' },
        { email: 'bursar@test.com', role: 'bursar', password: 'password123' },
        { email: 'teacher@test.com', role: 'teacher', password: 'password123' }
    ]

    for (const desired of desiredUsers) {
        const exists = userMap.find(u => u.email === desired.email)

        if (exists) {
            console.log(`✅ ${desired.role} user (${desired.email}) exists.`)
            // Fix role if mismatch
            if (exists.role !== desired.role && exists.role !== 'MISSING_PROFILE') {
                console.warn(`⚠️  Role mismatch for ${desired.email}. Expected ${desired.role}, got ${exists.role}. Correcting...`)
                await supabase.from('profiles').update({ role: desired.role }).eq('id', exists.id)
            }
            // Fix missing profile
            if (exists.role === 'MISSING_PROFILE') {
                console.warn(`⚠️  Profile missing for ${desired.email}. Creating...`)
                const { error: profileInsertError } = await supabase.from('profiles').insert({
                    id: exists.id,
                    tenant_id: tenant.id,
                    role: desired.role,
                    full_name: `Test ${desired.role.charAt(0).toUpperCase() + desired.role.slice(1)}`,
                    email: desired.email
                })
                if (profileInsertError) console.error(`❌ Failed to create profile: ${profileInsertError.message}`)
                else console.log(`✅ Profile created for ${desired.email}`)
            }
        } else {
            console.log(`⚠️  ${desired.role} user (${desired.email}) MISSING. Creating...`)

            // Create Auth User
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: desired.email,
                password: desired.password,
                email_confirm: true,
                user_metadata: { full_name: `Test ${desired.role.charAt(0).toUpperCase() + desired.role.slice(1)}` }
            })

            if (createError) {
                console.error(`❌ Failed to create ${desired.email}:`, createError.message)
                continue
            }

            if (!newUser.user) continue;

            // Create Profile
            const { error: profileInsertError } = await supabase.from('profiles').insert({
                id: newUser.user.id,
                tenant_id: tenant.id,
                role: desired.role,
                full_name: `Test ${desired.role.charAt(0).toUpperCase() + desired.role.slice(1)}`,
                email: desired.email
            })

            if (profileInsertError) {
                console.error(`❌ Failed to create profile for ${desired.email}:`, profileInsertError.message)
            } else {
                console.log(`✅ Created ${desired.email} with role ${desired.role}`)
            }
        }
    }
}

checkAndSeedUsers().catch(e => console.error(e))
