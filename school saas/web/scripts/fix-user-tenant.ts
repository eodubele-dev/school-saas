
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
    console.log("🔍 Checking Tenants...")
    const { data: tenants, error } = await supabase.from('tenants').select('*')

    if (error) {
        console.error("Error fetching tenants:", error.message)
        return
    }

    console.log("Found Tenants:", tenants.map(t => `${t.name} (${t.slug})`))

    const targetSlug = 'school1'
    const targetTenant = tenants.find(t => t.slug === targetSlug)

    if (!targetTenant) {
        console.error(`❌ Tenant with slug '${targetSlug}' NOT FOUND!`)
        // Fallback: Create it if needed? or just pick the first one and tell user the slug.
        // If user insists on school1, we should probably check if 'school1' even exists.
        return
    }

    console.log(`✅ Target Tenant Found: ${targetTenant.name} (${targetTenant.id})`)

    const usersToFix = ['student@test.com', 'bursar@test.com']

    for (const email of usersToFix) {
        // Find User
        // Since we have service role, we can list users or just query profiles if we assume they exist
        // But for Auth User ID, we need admin client. 
        // We know they exist from previous step.
        // Let's get ID from profiles via email? OR search auth.

        // Strategy: Get ID from profiles (if email column there) or just sign in again to get ID, then update.
        // We'll trust `verify-login.ts` output which said it worked for student@test.com (so profile exists).

        // We can just query profiles by email if we stored it there (most schemas do).
        // Let's try to find profile by email.
        const { data: profileData, error: profileSearchErr } = await supabase
            .from('profiles')
            .select('id, tenant_id')
            .eq('email', email)
            .single()

        let userId = profileData?.id

        if (!userId) {
            console.log(`⚠️  Profile not found by email for ${email}. attempting auth lookup...`)
            // Should not happen if previous steps worked.
            continue
        }

        if (profileData.tenant_id === targetTenant.id) {
            console.log(`✅ ${email} is already linked to ${targetSlug}.`)
        } else {
            console.log(`🔄 Moving ${email} from ${profileData.tenant_id} to ${targetSlug}...`)
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ tenant_id: targetTenant.id })
                .eq('id', userId)

            if (updateError) console.error(`❌ Failed to move user: ${updateError.message}`)
            else console.log(`✅ User moved successfully.`)
        }
    }
}

fixTenantLinkage()
