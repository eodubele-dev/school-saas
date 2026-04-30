
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log("Repairing 'Achieving Minds Schools'...")
    
    // 1. Fetch current data
    const { data: school, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('name', 'Achieving Minds Schools')
        .single()

    if (error || !school) {
        console.error("Error fetching school:", error)
        return
    }

    const tc = school.theme_config || {}
    
    // Values from theme_config
    const tier = tc.subscription_tier || 'pilot'
    const nairaDeposit = tc.sms_balance || 10000
    const units = Math.floor(nairaDeposit / 5.0)
    const pilotEndsAt = tc.pilot_ends_at
    const isActive = tc.is_active === undefined ? true : tc.is_active

    console.log(`Detected: Tier=${tier}, Naira=${nairaDeposit} -> Units=${units}, PilotEnds=${pilotEndsAt}`)

    // 2. Update top-level columns
    const { error: updateError } = await supabase
        .from('tenants')
        .update({
            subscription_tier: tier,
            sms_balance: units,
            is_active: isActive,
            pilot_ends_at: pilotEndsAt
        })
        .eq('id', school.id)

    if (updateError) {
        console.error("Update failed:", updateError)
    } else {
        console.log("Successfully repaired 'Achieving Minds Schools'.")
    }
}

run()
