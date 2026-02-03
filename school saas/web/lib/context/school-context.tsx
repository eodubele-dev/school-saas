'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface SchoolSettings {
    name: string
    logo_url: string | null
    theme: any
    session: string
    term: string
}

interface SchoolContextType {
    settings: SchoolSettings
    updateSettings: (newSettings: Partial<SchoolSettings>) => void
    isConnected: boolean
}

const defaultSettings: SchoolSettings = {
    name: 'EduFlow School',
    logo_url: null,
    theme: {},
    session: '2025/2026',
    term: '1st Term'
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined)

export function SchoolContextProvider({
    children,
    initialSettings
}: {
    children: ReactNode,
    initialSettings?: Partial<SchoolSettings>
}) {
    const [settings, setSettings] = useState<SchoolSettings>({ ...defaultSettings, ...initialSettings })
    const [isConnected, setIsConnected] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        // 1. Initial Fetch (if needed, or rely on props)
        setIsConnected(true)

        // 2. Realtime Subscription to Tenants Table
        // We listen for any UPDATE to the 'tenants' table 
        // to instantly reflect name/logo/theme changes.
        // NOTE: In production, filter by specific tenant_id row.
        const channel = supabase
            .channel('school-settings-sync')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'tenants' },
                (payload) => {
                    console.log('[SchoolContext] Realtime Update:', payload)
                    const newData = payload.new as any

                    // Optimistically update relevant fields
                    setSettings(prev => ({
                        ...prev,
                        name: newData.name || prev.name,
                        logo_url: newData.logo_url || prev.logo_url,
                        // Only update if changed
                        session: newData.current_session || prev.session,
                        term: newData.current_term || prev.term
                    }))

                    toast.info("School Settings Updated via Sync")
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[SchoolContext] Connected to Realtime Sync')
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const updateSettings = (partial: Partial<SchoolSettings>) => {
        setSettings(prev => ({ ...prev, ...partial }))
    }

    return (
        <SchoolContext.Provider value={{ settings, updateSettings, isConnected }}>
            {children}
        </SchoolContext.Provider>
    )
}

export function useSchoolContext() {
    const context = useContext(SchoolContext)
    if (context === undefined) {
        throw new Error('useSchoolContext must be used within a SchoolContextProvider')
    }
    return context
}
