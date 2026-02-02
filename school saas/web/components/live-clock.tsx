'use client'

import { useEffect, useState } from "react"

export function LiveClock() {
    const [time, setTime] = useState<string>('')

    useEffect(() => {
        // Set initial time
        const updateTime = () => {
            const now = new Date()
            setTime(now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                // second: '2-digit', 
                hour12: true,
                timeZone: 'Africa/Lagos'
            }))
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    if (!time) return <span className="opacity-0">--:--</span>

    return (
        <span className="font-mono font-medium text-slate-300">
            {time}
        </span>
    )
}
