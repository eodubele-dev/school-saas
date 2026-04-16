import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Diagnostic Logging (Safe for Server Logs)
    console.log('[createAdminClient] Init check:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
        env: process.env.NODE_ENV
    })

    if (!supabaseUrl || !supabaseServiceKey) {
        const missing = !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : 'SUPABASE_SERVICE_ROLE_KEY'
        throw new Error(`[CRITICAL_CONFIG_ERROR] ${missing} is missing from the environment. Please check your .env.local or Amplify console.`)
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
