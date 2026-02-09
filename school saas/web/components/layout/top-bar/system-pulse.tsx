"use client"

import { Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function SystemPulse() {
    const [status, setStatus] = useState<'optimal' | 'degraded' | 'offline'>('optimal')
    const [latency, setLatency] = useState<number>(0)

    useEffect(() => {
        const checkHealth = async () => {
            const start = performance.now()
            try {
                const supabase = createClient()
                const { error } = await supabase.from('tenants').select('count').limit(1).maybeSingle()

                if (error) throw error

                const end = performance.now()
                setLatency(Math.round(end - start))
                setStatus('optimal')
            } catch (err) {
                console.error("Health check failed", err)
                setStatus('offline')
            }
        }

        // Initial check
        checkHealth()

        // Poll every 30s
        const interval = setInterval(checkHealth, 30000)
        return () => clearInterval(interval)
    }, [])

    const getColor = () => {
        if (status === 'optimal') return 'text-green-500'
        if (status === 'degraded') return 'text-yellow-500'
        return 'text-red-500'
    }

    const getText = () => {
        if (status === 'optimal') return `SYS_OPTIMAL (${latency}ms)`
        if (status === 'degraded') return 'SYS_DEGRADED'
        return 'SYS_OFFLINE'
    }

    return (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800">
            <Activity size={14} className={`${getColor()} animate-pulse`} />
            <span className={`text-[10px] font-mono ${status === 'offline' ? 'text-red-400' : 'text-slate-400'}`}>
                {getText()}
            </span>
        </div>
    )
}
