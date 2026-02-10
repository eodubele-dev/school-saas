'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAuditStudents() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // 1. Check Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    const role = profile?.role || 'parent' // Default to safest role

    // 2. Fetch Logic
    if (['admin', 'teacher', 'principal', 'registrar'].includes(role)) {
        // ADMIN: Fetch ALL active students in the tenant
        // Optimization: limit to 20 or simple list for searching in future
        const { data: students } = await supabase
            .from('students')
            .select('id, full_name, passport_url, admission_number, class:classes(name)')
            .eq('status', 'active')
            .eq('tenant_id', profile?.tenant_id)
            .order('full_name')
            .limit(50)

        return (students || []).map(s => ({
            id: s.id,
            full_name: s.full_name,
            passport_url: s.passport_url,
            // Add class name to disambiguate
            details: `${s.admission_number} • ${Array.isArray(s.class) ? s.class[0]?.name : s.class?.name || 'No Class'}`
        }))
    } else {
        // PARENT: Fetch ONLY linked students
        const { data: students } = await supabase
            .from('students')
            .select('id, full_name, passport_url')
            .eq('parent_id', user.id)

        return (students || []).map(s => ({
            id: s.id,
            full_name: s.full_name,
            passport_url: s.passport_url,
            details: 'Child'
        }))
    }
}
