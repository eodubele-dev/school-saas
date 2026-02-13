const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1')
    }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRLSPolicies() {
    const { data: policies, error } = await supabase
        .rpc('get_table_policies', { table_name_input: 'profiles' })

    if (error) {
        // Fallback: try another way if rpc doesn't exist
        console.log('RPC get_table_policies failed, trying direct query if possible...')
        const { data: rawPolicies, error: rawError } = await supabase.from('pg_policies').select('*').eq('tablename', 'profiles')
        // Usually pg_policies is not accessible via PostgREST unless exposed.
        if (rawError) {
            console.error('Could not fetch policies via SDK. Please check schema.sql or migrations manually.')
        } else {
            console.log('Policies:', rawPolicies)
        }
        return
    }

    console.log('Policies for profiles:', policies)
}

checkRLSPolicies()
