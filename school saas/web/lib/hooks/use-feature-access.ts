"use client"

import { useSession } from "next-auth/react" // Note: Assuming standard session or custom supabase session
// Since this is a Supabase app, we might be using a custom store or supabase-js
// Let's use a pattern that works with the existing user metadata in JWT.

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { SubscriptionTier, TIER_RANK } from "@/config/subscriptions"

export function useFeatureAccess() {
    const [tier, setTier] = useState<SubscriptionTier>('starter')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTier() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user?.app_metadata?.subscriptionTier) {
                setTier(user.app_metadata.subscriptionTier as SubscriptionTier)
            }
            setLoading(false)
        }
        fetchTier()
    }, [])

    const hasFeature = (requiredTier: SubscriptionTier) => {
        // Pilot is a special case: it has some features of Starter but 100 student limit.
        // For feature gating, we treat it as level 0.
        return TIER_RANK[tier] >= TIER_RANK[requiredTier]
    }

    const isPlatinum = tier === 'platinum'
    const isProfessional = TIER_RANK[tier] >= TIER_RANK['professional']
    const isStarter = TIER_RANK[tier] >= TIER_RANK['starter']

    return {
        tier,
        hasFeature,
        isPlatinum,
        isProfessional,
        isStarter,
        loading
    }
}
