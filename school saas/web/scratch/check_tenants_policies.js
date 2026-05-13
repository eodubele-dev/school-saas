const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkPolicies() {
  console.log('Checking policies for table: tenants')
  try {
    const { data, error } = await supabase.rpc('get_policies', { table_name_input: 'tenants' })
    if (error) {
       // If RPC fails, try querying pg_policies
       const { data: policies, error: pError } = await supabase.from('pg_policies').select('*').eq('tablename', 'tenants')
       if (pError) {
           // Third attempt: manual query via raw SQL if possible, but we don't have raw SQL tool.
           // Let's try selecting from a system view if allowed
           console.error('Error fetching policies:', pError)
       } else {
           console.log('Policies found:', policies)
       }
    } else {
      console.log('Policies:', data)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkPolicies()
