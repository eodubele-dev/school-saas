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

const TENANT_ID = 'e18076ff-0404-41aa-a97d-c2b884753ddc'

async function debugAllStaff() {
    const { data: staff, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .in('role', ['admin', 'teacher', 'bursar', 'registrar', 'support_staff'])

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Final Staff Check for school1:')
    staff.forEach(s => {
        console.log(`- Name: ${s.full_name}, Role: ${s.role}, Status: ${s.status}, ID: ${s.id}`)
    })
}

debugAllStaff()
