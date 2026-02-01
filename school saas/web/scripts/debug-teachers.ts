import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTeachers() {
    const { data: teachers, error } = await supabase
        .from('profiles')
        .select('full_name, role, tenant_id, tenants(slug)')
        .eq('role', 'teacher')

    if (error) {
        console.error('Error fetching teachers:', error)
        return
    }

    console.log('Teacher Profiles:')
    console.table(teachers.map(t => ({
        name: t.full_name,
        role: t.role,
        slug: (t as any).tenants?.slug || 'MISSING'
    })))
}

checkTeachers()
