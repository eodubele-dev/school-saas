import { createClient } from "@supabase/supabase-js"
import fs from "fs"

const env = fs.readFileSync(".env.local", "utf8")
const getEnv = (key) => env.split('\n').find(l => l.startsWith(key))?.split('=')[1]?.trim()

const supabase = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY")
)

async function debugMaintenance() {
    console.log("--- DEBUGGING MAINTENANCE TICKETS ---")

    // 1. Check if table exists and count records (Service Role ignores RLS)
    const { data: countData, error: countError } = await supabase
        .from('maintenance_items')
        .select('*', { count: 'exact', head: true })

    if (countError) {
        console.error("Error fetching count:", countError.message)
    } else {
        console.log("Total tickets (Service Role):", countData?.length || 0)
    }

    // 2. Check for recent records
    const { data: recent, error: recentError } = await supabase
        .from('maintenance_items')
        .select('id, tenant_id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

    if (recentError) {
        console.error("Error fetching recent:", recentError.message)
    } else {
        console.log("Recent Tickets:", JSON.stringify(recent, null, 2))
    }

    // 3. Check for tenant ID consistency
    if (recent && recent.length > 0) {
        const firstTenantId = recent[0].tenant_id
        console.log("Checking if profiles exist for tenant:", firstTenantId)

        const { count: profileCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', firstTenantId)

        console.log(`Profiles found for this tenant: ${profileCount}`)
    }
}

debugMaintenance()
