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

const PRINCIPAL_ID = 'e6f2ac23-6272-4e13-a936-e853a94cb5db'

async function debugPrincipal() {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', PRINCIPAL_ID)
        .single()

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log('Principal Profile Keys:', Object.keys(profile))
    console.log('Principal Profile Data:', profile)
}

debugPrincipal()
