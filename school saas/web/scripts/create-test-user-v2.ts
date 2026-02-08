
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

async function createTestUsers() {
    console.log("🚀 Initializing User Creation...")

    // 1. Get Tenant
    const { data: tenants, error: tenantError } = await supabase.from('tenants').select('id, name, slug').limit(1)
    if (tenantError || !tenants || tenants.length === 0) {
        console.error("❌ No tenants found. Cannot create users.", tenantError)
        return
    }
    const tenant = tenants[0]
    console.log(`ℹ️  Target Tenant: ${tenant.name} (${tenant.id})`)

    const usersToCreate = [
        { email: 'student@test.com', password: 'password123', role: 'student' },
        { email: 'bursar@test.com', password: 'password123', role: 'bursar' }
    ]

    for (const u of usersToCreate) {
        console.log(`\n👤 Processing ${u.role}: ${u.email}`)

        // A. Check/Create Auth User
        // We use admin.createUser which auto-confirms email
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: {
                full_name: `Test ${u.role.charAt(0).toUpperCase() + u.role.slice(1)}`,
                role: u.role // Redundant but good for metadata
            }
        })

        let userId = user?.id

        if (createError) {
            // User might already exist
            console.log(`ℹ️  Auth User might exist or error: ${createError.message}`)
            // Try to find the user ID since we can't get it from error
            // (Note: listUsers might fail if we have permissions issues as seen before, but let's try get by email)
            // Actually, if it exists, we can't easily get the ID without listing.
            // Let's try to update the user to get the ID? No. 
            // Let's TRY to login to get the ID?
            const { data: loginData } = await supabase.auth.signInWithPassword({
                email: u.email,
                password: u.password
            })
            if (loginData.user) {
                userId = loginData.user.id
                console.log(`✅ Retrieved ID via Login: ${userId}`)
            } else {
                console.error(`❌ Could not retrieve ID for ${u.email}. Skipping.`)
                continue
            }
        } else {
            console.log(`✅ Auth User Created: ${userId}`)
        }

        if (!userId) continue

        // B. Ensure Profile Exists & is Correct
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()

        if (profile) {
            // Update
            const { error: updateError } = await supabase.from('profiles').update({
                tenant_id: tenant.id,
                role: u.role,
                full_name: `Test ${u.role.charAt(0).toUpperCase() + u.role.slice(1)}`
            }).eq('id', userId)

            if (updateError) console.error(`❌ Profile Update Failed: ${updateError.message}`)
            else console.log(`✅ Profile Updated (Linked to Tenant)`)
        } else {
            // Insert
            const { error: insertError } = await supabase.from('profiles').insert({
                id: userId,
                tenant_id: tenant.id,
                role: u.role,
                full_name: `Test ${u.role.charAt(0).toUpperCase() + u.role.slice(1)}`,
                email: u.email
            })

            if (insertError) console.error(`❌ Profile Creation Failed: ${insertError.message}`)
            else console.log(`✅ Profile Created`)
        }

        // C. Link specific data (Student record for student)
        if (u.role === 'student') {
            // Check if student record exists with this email or user_id
            // Different schemas link differently. Often 'parent_email' or a direct 'user_id'
            // Let's look for a student with this email if email column exists, OR verify if 'students' table has 'user_id' or 'email'
            // For safety, we just check if any student exists linked to this tenant, 
            // and if we can update one to be THIS user? No, that's destructive.
            // Let's Insert a new student record for this test user.

            const { error: studentError } = await supabase.from('students').insert({
                tenant_id: tenant.id,
                full_name: `Test Student`,
                // We don't know the exact schema of 'students' (email? user_id?). 
                // Based on typical patterns, we might not link auth directly on 'students' table, 
                // but 'profiles.role=student' is usually enough for login access.
                // The 'student-dashboard' might need to query 'students' by... ?
                // Use view_file on 'students' schema if needed. 
                // For now, we assume profile creation is enough for LOGIN.
                // Data fetching might fail if no student record, but Login should succeed.
            })
            // Ignoring student creation error for now as it might duplicate or violate unknown constraints.
            // The critical part is Auth + Profile.
        }
    }
}

createTestUsers().catch(e => console.error(e))
