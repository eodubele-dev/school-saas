const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1')
    }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listAllProfiles() {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, tenant_id, tenants(slug)')

    if (error) {
        fs.writeFileSync('scripts/profiles_full.txt', 'Error fetching profiles: ' + JSON.stringify(error), 'utf8')
        return
    }

    let output = 'User Profiles:\n'
    profiles.forEach(p => {
        output += `- ${p.full_name} (${p.role}) [ID: ${p.id}] -> Tenant: ${p.tenants ? p.tenants.slug : 'MISSING'} (ID: ${p.tenant_id})\n`
    })

    fs.writeFileSync('scripts/profiles_full.txt', output, 'utf8')
    console.log('Wrote to scripts/profiles_full.txt')
}

listAllProfiles()
