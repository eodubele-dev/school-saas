
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log("Checking for Pilot schools with 0 SMS balance...")
    
    const { data: schools, error } = await supabase
        .from('tenants')
        .select('id, name, slug, sms_balance, subscription_tier')
        .eq('subscription_tier', 'pilot')
        .eq('sms_balance', 0)

    if (error) {
        console.error("Error fetching schools:", error)
        return
    }

    if (!schools || schools.length === 0) {
        console.log("No affected schools found.")
        return
    }

    console.log(`Found ${schools.length} affected schools:`)
    for (const school of schools) {
        console.log(`- ${school.name} (${school.slug})`)
        
        // Option to credit: 2000 units
        // const { error: updateError } = await supabase
        //     .from('tenants')
        //     .update({ sms_balance: 2000 })
        //     .eq('id', school.id)
        
        // if (updateError) console.error(`Failed to credit ${school.name}:`, updateError)
        // else console.log(`Successfully credited ${school.name} with 2000 units.`)
    }
}

run()
