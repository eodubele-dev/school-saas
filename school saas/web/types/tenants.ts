export interface Tenant {
    id: string
    name: string
    address?: string
    motto?: string
    logo_url?: string
    domain?: string
    slug: string
    tier: 'Free' | 'Standard' | 'Premium' | 'Platinum'
    theme_config?: {
        primary: string
        secondary: string
        accent: string
    }
    created_at: string
}
