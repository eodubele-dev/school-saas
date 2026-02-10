const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectData() {
    console.log('--- Inspecting Tenants ---')
    const { data: tenants, error: tenantError } = await supabase
        .from('tenants')
        .select('name, slug, logo_url')
        .limit(5)

    if (tenantError) console.error('Tenant Error:', tenantError)
    else console.log(JSON.stringify(tenants, null, 2))

    console.log('\n--- Inspecting Profiles ---')
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .limit(5)

    if (profileError) console.error('Profile Error:', profileError)
    else console.log(JSON.stringify(profiles, null, 2))
}

inspectData()
