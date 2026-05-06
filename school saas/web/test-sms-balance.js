import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jggcixrapxccbxckuofw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU'

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY)

async function checkSmsBalance() {
    console.log("Checking sms_balance for tenants...")
    const { data, error } = await supabaseAdmin.from('tenants').select('slug, name, sms_balance')
    
    if (error) {
        console.error("Error:", error)
    } else {
        console.table(data)
    }
}

checkSmsBalance()
