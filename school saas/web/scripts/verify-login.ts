
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) return {}
    const content = fs.readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) env[match[1]] = match[2].replace(/"/g, '').trim()
    })
    return env
}

const env = loadEnv()
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Missing SUPABASE_URL or ANON_KEY")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkLogin() {
    console.log("🚀 Checking Login for student@test.com...")
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'student@test.com',
        password: 'password123'
    })

    if (error) {
        console.error(`❌ Login Failed: ${error.message}`)
    } else {
        console.log(`✅ Login SUCCESS! User ID: ${data.user.id}`)

        // Check Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

        if (profileError) {
            console.error(`❌ Profile Fetch Failed: ${profileError.message}`)
        } else {
            console.log(`✅ Profile Found: Role=${profile.role}, Tenant=${profile.tenant_id}`)
        }
    }
}

checkLogin()
