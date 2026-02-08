
import fs from "fs"
import path from "path"
import { Client } from "pg"

// Manual .env.local parser
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (!fs.existsSync(envPath)) {
        console.warn("⚠️ .env.local not found!")
        return {}
    }
    const content = fs.readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/)
        if (match) {
            env[match[1]] = match[2].replace(/"/g, '').trim()
        }
    })
    return env
}

const env = loadEnv()
// Try DATABASE_URL first, then construct from Supabase credentials if possible (less reliable)
// Usually DATABASE_URL is present for Prisma/Drizzle.
const connectionString = env.DATABASE_URL || env.POSTGRES_URL || env.SUPABASE_DB_URL

if (!connectionString) {
    console.error("❌ Missing DATABASE_URL in .env.local")
    console.log("Available Keys:", Object.keys(env))
    process.exit(1)
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
})

async function fixRLS() {
    console.log("🚀 Connecting to Database...")
    try {
        await client.connect()
        console.log("✅ Connected.")

        const sql = `
            -- Fix Profiles RLS Recursion
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

            -- 1. Drop existing policies
            DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
            DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
            DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
            DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
            
            -- 2. Create a non-recursive read policy
            CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);

            -- 3. Allow self-update
            DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
            CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

            -- 4. Allow insert
            DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
            CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
        `

        console.log("🛠️  Executing SQL...")
        await client.query(sql)
        console.log("✅ SQL Executed Successfully.")

    } catch (e: any) {
        console.error("❌ Error:", e.message)
    } finally {
        await client.end()
    }
}

fixRLS()
