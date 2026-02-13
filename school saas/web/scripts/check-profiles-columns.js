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

async function checkProfilesColumns() {
    const { data: cols, error } = await supabase
        .rpc('get_table_columns', { table_name: 'profiles' })

    if (error) {
        // Fallback: try to select just one row and see keys
        const { data: profile } = await supabase.from('profiles').select('*').limit(1).single()
        if (profile) {
            console.log('Columns in profiles (via select *):', Object.keys(profile))
        } else {
            console.error('Error fetching columns:', error)
        }
        return
    }

    console.log('Columns in profiles:', cols)
}

checkProfilesColumns()
