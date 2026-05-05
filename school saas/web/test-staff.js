import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jggcixrapxccbxckuofw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testStaffList() {
    console.log("Fetching tenants to get a valid tenantId...")
    const { data: tenants, error: tError } = await supabase.from('tenants').select('id, slug').limit(1)
    
    if (tError || !tenants || tenants.length === 0) {
        console.error("Failed to fetch tenant:", tError)
        return
    }
    
    const tenantId = tenants[0].id
    console.log(`Using Tenant ID: ${tenantId} (${tenants[0].slug})`)

    console.log("Running getStaffList query...")
    const { data, count, error } = await supabase
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
        .eq('tenant_id', tenantId)
        .in('role', ['admin', 'teacher', 'bursar', 'registrar', 'support_staff', 'owner'])
        .order('created_at', { ascending: false })
        .range(0, 9)

    if (error) {
        console.error("SUPABASE ERROR:", error)
        return
    }

    console.log(`Success! Found ${count} staff members.`)
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...')
}

testStaffList()
