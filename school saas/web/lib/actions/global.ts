'use server'

import { createClient } from '@/lib/supabase/server'

export type GlobalStats = {
    totalRevenue: number
    totalStudents: number
    totalStaff: number
    campusCount: number
    campuses: {
        id: string
        name: string
        slug: string
        studentCount: number
        revenue: number
        status: 'active' | 'maintenance' | 'offline'
    }[]
}

export type TenantOption = {
    id: string
    name: string
    slug: string
    logoUrl?: string
}

export async function getTenants(): Promise<TenantOption[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch the user's profile to get their specific tenant
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id, tenants(id, name, slug, logo_url)')
        .eq('id', user.id)
        .single()

    // If super_admin, they can see all campuses
    if (profile?.role === 'super_admin') {
        const { data: allTenants } = await supabase
            .from('tenants')
            .select('id, name, slug, logo_url')

        return (allTenants || []).map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            logoUrl: t.logo_url || undefined
        }))
    }

    // Normal admins/proprietors only see their own campus
    if (profile?.tenants) {
        const t = profile.tenants as any
        return [{
            id: t.id,
            name: t.name,
            slug: t.slug,
            logoUrl: t.logo_url || undefined
        }]
    }

    return []
}

export async function getGlobalStats(): Promise<GlobalStats> {
    const supabase = createClient()

    const { data: tenants } = await supabase.from('tenants').select('*')

    if (!tenants || tenants.length === 0) {
        return {
            totalRevenue: 0,
            totalStudents: 0,
            totalStaff: 0,
            campusCount: 0,
            campuses: []
        }
    }

    const { data: students } = await supabase.from('students').select('tenant_id')
    const { data: staff } = await supabase.from('profiles').select('tenant_id').in('role', ['teacher', 'admin', 'principal', 'bursar'])
    const { data: transactions } = await supabase.from('transactions').select('tenant_id, amount').eq('status', 'success')

    let totalRevenue = 0
    let totalStudents = students?.length || 0
    let totalStaff = staff?.length || 0

    const campuses = tenants.map(tenant => {
        const studentCount = students?.filter(s => s.tenant_id === tenant.id).length || 0
        const tenantTransactions = transactions?.filter(t => t.tenant_id === tenant.id) || []
        const revenue = tenantTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

        totalRevenue += revenue

        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            studentCount,
            revenue,
            status: 'active' as const
        }
    })

    return {
        totalRevenue,
        totalStudents,
        totalStaff,
        campusCount: tenants.length,
        campuses
    }
}

export async function createFactoryTenant(formData: FormData) {
    const supabase = createClient()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const address = formData.get('address') as string

    if (!name || !slug) {
        return { error: "Name and Slug are required" }
    }

    // validate slug format (simple regex)
    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { error: "Slug must be lowercase alphanumeric with hyphens only" }
    }

    try {
        const { data, error } = await supabase
            .from('tenants')
            .insert({
                name,
                slug,
                theme_config: {
                    primary: "#2563eb",
                    accent: "#0ea5e9",
                    address: address
                }
            })
            .select()
            .single()

        if (error) {
            console.error("Error creating tenant:", error)
            return { error: error.message }
        }

        return { success: true, tenant: data }
    } catch (err) {
        return { error: "Internal Server Error" }
    }
}
