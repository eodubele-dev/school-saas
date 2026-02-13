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

// Principal (admin) [ID: e6f2ac23-6272-4e13-a936-e853a94cb5db]
const PRINCIPAL_ID = 'e6f2ac23-6272-4e13-a936-e853a94cb5db'

async function simulateGetStaffList() {
    // 1. Get Principal's profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', PRINCIPAL_ID)
        .single()

    console.log('Principal Tenant ID:', profile.tenant_id)

    // 2. Run the staff list query
    const { data: staff, count, error } = await supabase
        .from('profiles')
        .select(`
            *,
            staff_permissions (
                designation,
                signature_url,
                can_view_financials,
                can_edit_results,
                can_send_bulk_sms
            )
        `, { count: 'exact' })
        .eq('tenant_id', profile.tenant_id)
        .in('role', ['admin', 'teacher', 'bursar', 'registrar', 'support_staff'])
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Staff found:', staff.length)
    staff.forEach(s => {
        console.log(`- ${s.full_name} (${s.role})`)
    })
}

simulateGetStaffList()
