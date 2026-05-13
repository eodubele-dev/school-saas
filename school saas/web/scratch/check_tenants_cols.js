const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkColumns() {
  console.log('Checking columns for table: tenants')
  try {
    const { data, error } = await supabase.from('tenants').select('*').limit(1)
    if (error) {
      console.error('Error fetching tenants:', error)
    } else {
      console.log('Tenants columns found:', Object.keys(data[0] || {}))
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkColumns()
