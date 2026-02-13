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

async function checkTrigger() {
    const { data: triggers, error } = await supabase
        .rpc('list_table_triggers', { table_name_input: 'profiles' })

    if (error) {
        // Fallback: try to see if we can get it from somewhere else or just assume it might be missing
        console.log('Error fetching triggers via RPC:', error.message)
        const { data, error: queryError } = await supabase.from('information_schema.triggers').select('*').eq('event_object_table', 'profiles')
        if (queryError) {
            console.error('Could not query triggers table.')
        } else {
            console.log('Triggers on profiles:', data.map(t => t.trigger_name))
        }
        return
    }

    console.log('Triggers on profiles:', triggers)
}

checkTrigger()
