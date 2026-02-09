"use client"

import { useEffect, useState } from "react"
import { BadgeCelebrationOverlay, UnseenBadge } from "./badge-celebration-overlay"
import { getUnseenBadges, markBadgeAsSeen } from "@/lib/actions/rewards"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function BadgeCheck() {
    const [badges, setBadges] = useState<UnseenBadge[]>([])
    const [currentBadge, setCurrentBadge] = useState<UnseenBadge | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkBadges = async () => {
            const { success, data } = await getUnseenBadges()
            if (success && data && data.length > 0) {
                setBadges(data as UnseenBadge[])
                setCurrentBadge(data[0] as UnseenBadge)
            }
            setLoading(false)
        }
        checkBadges()
    }, [])

    const handleDismiss = async () => {
        if (!currentBadge) return

        // 1. Mark as seen in DB
        await markBadgeAsSeen(currentBadge.id)

        // 2. Remove from local queue
        const remaining = badges.slice(1)
        setBadges(remaining)

        if (remaining.length > 0) {
            setCurrentBadge(remaining[0])
        } else {
            setCurrentBadge(null)
        }
    }

    const handleAddToPortfolio = async () => {
        if (!currentBadge) return

        // 1. Mark as seen
        await markBadgeAsSeen(currentBadge.id)

        // 2. Redirect to portfolio
        router.push('/dashboard/student/portfolio')
        toast.success("Added to your Growth Portfolio!")
        setCurrentBadge(null)
    }

    if (loading || !currentBadge) return null

    return (
        <BadgeCelebrationOverlay
            badge={currentBadge}
            onDismiss={handleDismiss}
            onAddToPortfolio={handleAddToPortfolio}
        />
    )
}
