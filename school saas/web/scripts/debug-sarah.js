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

const SARAH_ID = 'b5fcb81d-9ca3-4343-b858-fb8842fe923f'

async function debugSarah() {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', SARAH_ID)
        .single()

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Sarah Profile Data:', profile)

    const { data: perms } = await supabase
        .from('staff_permissions')
        .select('*')
        .eq('staff_id', SARAH_ID)

    console.log('Sarah Permissions:', perms)
}

debugSarah()
