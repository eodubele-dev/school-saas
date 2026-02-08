
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
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function createDebugUser() {
    const testEmail = `student_${Date.now()}@school1.com`
    console.log(`🚀 Attempting to create: ${testEmail}`)

    const { data, error } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        user_metadata: { role: 'student', full_name: 'Debug Student' }
    })

    if (error) {
        console.error("❌ Creation Failed:", error.message)
    } else {
        console.log("✅ Success! User ID:", data.user.id)

        // Try to link profile
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: testEmail,
            role: 'student',
            full_name: 'Debug Student',
            // We need tenant ID, fetching it...
            tenant_id: 'e18076ff-0404-41aa-a988-5d2753ddc839' // Hardcoded from previous log for speed
        })

        if (profileError) console.error("❌ Profile Creation Failed:", profileError.message)
        else console.log("✅ Profile Created.")
    }
}

createDebugUser()
