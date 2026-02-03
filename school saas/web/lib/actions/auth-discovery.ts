'use server'

import { createClient } from '@/lib/supabase/client' // Use client for anon access? No, actions run on server.
import { createClient as createServerClient } from '@/lib/supabase/server'

export interface SchoolDiscoveryResult {
    name: string
    slug: string
    logo: string | null
    role: string
}

export async function findSchoolsByEmail(email: string): Promise<{ success: boolean, schools?: SchoolDiscoveryResult[], error?: string }> {
    const supabase = createServerClient()

    try {
        const { data, error } = await supabase.rpc('get_user_schools', { email_input: email })

        if (error) {
            console.error('Discovery Error:', error)
            return { success: false, error: 'Failed to search for schools.' }
        }

        if (!data || data.length === 0) {
            return { success: true, schools: [] }
        }

        // Map to cleaner interface
        const schools = data.map((d: any) => ({
            name: d.tenant_name,
            slug: d.tenant_slug,
            logo: d.tenant_logo,
            role: d.role
        }))

        return { success: true, schools }

    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
