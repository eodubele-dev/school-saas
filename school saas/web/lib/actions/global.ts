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

    // In a real scenario with proper RLS bypass or "owner" role seeing all, 
    // we would query: supabase.from('tenants').select('id, name, slug, logo_url')

    // For now, we'll return the demo tenant + some mocks to simulate multi-campus
    // This allows the Switcher UI to be built and tested.

    const { data: realTenants } = await supabase.from('tenants').select('id, name, slug, logo_url')

    const mockTenants: TenantOption[] = [
        { id: 'mock-1', name: 'Lekki Campus', slug: 'lekki', logoUrl: '/logos/lekki.png' },
        { id: 'mock-2', name: 'Ikeja Campus', slug: 'ikeja', logoUrl: '/logos/ikeja.png' },
        { id: 'mock-3', name: 'Victoria Island', slug: 'vi', logoUrl: '/logos/vi.png' }
    ]

    // Deduplicate if real tenants exist
    const combined = [...(realTenants || []), ...mockTenants].filter((v, i, a) => a.findIndex(t => (t.slug === v.slug)) === i)

    return combined.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        logoUrl: 'logo_url' in t ? t.logo_url : t.logoUrl || undefined
    }))
}

export async function getGlobalStats(): Promise<GlobalStats> {
    // Mock aggregated data
    // In production, this would use an admin client to sum(revenue) across all tenants

    return {
        totalRevenue: 15420000,
        totalStudents: 1250,
        totalStaff: 145,
        campusCount: 4,
        campuses: [
            { id: 'demo', name: 'Demo School', slug: 'demo-school', studentCount: 450, revenue: 5200000, status: 'active' },
            { id: 'lekki', name: 'Lekki Campus', slug: 'lekki', studentCount: 350, revenue: 4800000, status: 'active' },
            { id: 'ikeja', name: 'Ikeja Campus', slug: 'ikeja', studentCount: 300, revenue: 3100000, status: 'maintenance' },
            { id: 'vi', name: 'Victoria Island', slug: 'vi', studentCount: 150, revenue: 2320000, status: 'active' }
        ]
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
