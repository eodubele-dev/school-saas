'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingBar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isAnimating, setIsAnimating] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // When pathname or searchParams change, the navigation has likely started/ended
        // But Next.js doesn't give us a "navigation start" event easily.
        // We will rely on the SidebarClient to trigger a "loading" state if needed,
        // but for now, we'll auto-complete the bar when the pathname stableizes.
        setIsAnimating(false)
        setProgress(100)

        const timer = setTimeout(() => {
            setProgress(0)
        }, 500)

        return () => clearTimeout(timer)
    }, [pathname, searchParams])

    // Global listener for custom 'navigation-start' event if we want to be proactive
    useEffect(() => {
        const handleStart = () => {
            setIsAnimating(true)
            setProgress(30)
        }
        window.addEventListener('navigation-start', handleStart)
        return () => window.removeEventListener('navigation-start', handleStart)
    }, [])

    return (
        <AnimatePresence>
            {(isAnimating || (progress > 0 && progress < 100)) && (
                <motion.div
                    initial={{ scaleX: 0, opacity: 1 }}
                    animate={{
                        scaleX: progress / 100,
                        transition: progress === 100 ? { duration: 0.3 } : { duration: 10, ease: "linear" }
                    }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 h-1 z-[9999] origin-left bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 shadow-[0_0_15px_rgba(59,130,241,0.5)]"
                    style={{ scaleX: progress / 100 }}
                />
            )}
        </AnimatePresence>
    )
}
