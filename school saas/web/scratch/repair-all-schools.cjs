
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log("Auditing all tenants for mismatched data...")
    
    const { data: schools, error } = await supabase.from('tenants').select('*')

    if (error) {
        console.error("Error fetching schools:", error)
        return
    }

    for (const school of schools) {
        const tc = school.theme_config || {}
        const tier = tc.subscription_tier
        const nairaInConfig = tc.sms_balance
        
        // If theme_config has data that isn't at the top level
        if (tier && (school.subscription_tier !== tier || school.sms_balance === 0)) {
            console.log(`Mismatch found for ${school.name}:`)
            
            const targetTier = tier
            const units = Math.floor((nairaInConfig || 0) / 5.0)
            const pilotEndsAt = tc.pilot_ends_at
            
            console.log(`  Updating to Tier=${targetTier}, Balance=${units} Units`)
            
            const { error: updateError } = await supabase
                .from('tenants')
                .update({
                    subscription_tier: targetTier,
                    sms_balance: units > 0 ? units : school.sms_balance,
                    pilot_ends_at: pilotEndsAt || school.pilot_ends_at
                })
                .eq('id', school.id)
            
            if (updateError) console.error(`  Update failed for ${school.name}:`, updateError)
            else console.log(`  Successfully repaired ${school.name}.`)
        }
    }
    console.log("Audit complete.")
}

run()
