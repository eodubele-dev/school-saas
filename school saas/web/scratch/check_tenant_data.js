const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkData() {
  console.log('Checking theme_config for first tenant')
  try {
    const { data, error } = await supabase.from('tenants').select('theme_config').limit(1).single()
    if (error) {
      console.error('Error fetching tenant:', error)
    } else {
      console.log('Theme Config:', JSON.stringify(data.theme_config, null, 2))
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkData()
