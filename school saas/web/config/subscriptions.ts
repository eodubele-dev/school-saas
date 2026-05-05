export type SubscriptionTier = 'pilot' | 'starter' | 'professional' | 'platinum'

export const TIER_RANK: Record<SubscriptionTier, number> = {
    'pilot': 0,
    'starter': 1,
    'professional': 2,
    'platinum': 3
}

export const SUBSCRIPTION_LIMITS = {
    STUDENT_CAPACITY: {
        'pilot': 100,
        'starter': 300,
        'professional': Infinity,
        'platinum': Infinity
    }
}

export const SUBSCRIPTION_PRICING: Record<SubscriptionTier, number> = {
    'pilot': 0,
    'starter': 20000,
    'professional': 50000,
    'platinum': 150000
}

export const PROTECTED_ZONES = [
    { prefix: '/dashboard/admin/security/gate', min: 'platinum' as SubscriptionTier },
    { prefix: '/dashboard/admin/health', min: 'platinum' as SubscriptionTier },
    { prefix: '/dashboard/admin/voice', min: 'platinum' as SubscriptionTier },
    { prefix: '/dashboard/admin/curriculum', min: 'platinum' as SubscriptionTier },
    { prefix: '/dashboard/logistics', min: 'professional' as SubscriptionTier },
    { prefix: '/dashboard/admin/hostels', min: 'professional' as SubscriptionTier },
    { prefix: '/dashboard/admin/inventory', min: 'professional' as SubscriptionTier },
    { prefix: '/dashboard/bursar', min: 'professional' as SubscriptionTier },
    { prefix: '/dashboard/admin/executive', min: 'professional' as SubscriptionTier },
]
