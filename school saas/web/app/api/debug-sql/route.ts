import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use environment variables that are usually available in the project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(req: Request) {
    try {
        const { query } = await req.json()

        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)

        // For arbitrary SQL, we usually need the service role or a specific endpoint.
        // However, if the project has a function meant for this, we use it.
        // For now, let's try to use the rpc 'exec_sql' if it exists, or just return an error instruction.

        const { data, error } = await supabase.rpc('exec_sql', { sql: query })

        if (error) {
            // Attempt another common way if rpc fails
            const { data: data2, error: error2 } = await supabase.from('students').select('*').limit(1)
            return NextResponse.json({
                error: error.message,
                details: 'RPC exec_sql might not exist. Check students table connection: ' + (error2 ? error2.message : 'OK')
            })
        }

        return NextResponse.json({ data })

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
