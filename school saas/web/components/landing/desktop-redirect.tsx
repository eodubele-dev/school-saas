"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isDesktop } from "@/lib/utils/desktop"

export function DesktopRedirect() {
    const router = useRouter()

    useEffect(() => {
        if (isDesktop()) {
            router.push('/login')
        }
    }, [router])

    return null
}
