const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read .env.local manually
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

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTeachers() {
    const { data: teachers, error } = await supabase
        .from('profiles')
        .select('full_name, role, tenant_id, tenants(slug)')
        .eq('role', 'teacher')

    if (error) {
        console.error('Error fetching teachers:', error)
        return
    }

    console.log('Teacher Profiles:')
    teachers.forEach(t => {
        console.log(`- ${t.full_name} (${t.role}) -> ${t.tenants ? t.tenants.slug : 'MISSING'}`)
    })
}

checkTeachers()
