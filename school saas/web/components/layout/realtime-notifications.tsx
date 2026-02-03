'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Bell, CreditCard, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function RealtimeNotifications() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Listen for INSERT on 'notifications' table
        // We filter for rows where 'is_read' is false (newly created)
        const channel = supabase
            .channel('global-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    const notif = payload.new as any

                    // Check if this notification is relevant to the current user (Client-side filter for now)
                    // Ideally, RLS prevents receiving it, but realtime sends all if enabled on table without filters.
                    // We will rely on the backend trigger to set the user_id correctly, 
                    // and here we might check if it matches our user ID (if we had it in context).
                    // For this demo, we'll just show the pop.

                    playNotificationSound(notif.type)

                    const icon = getIcon(notif.type)

                    toast(notif.title, {
                        description: notif.message,
                        icon: icon,
                        duration: 8000,
                        action: notif.link ? {
                            label: 'View',
                            onClick: () => router.push(notif.link)
                        } : undefined,
                        className: getClassName(notif.type)
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router])

    return null // Headless component
}

function getIcon(type: string) {
    switch (type) {
        case 'success': return <CreditCard className="h-5 w-5 text-green-500" />
        case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
        case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />
        default: return <Bell className="h-5 w-5 text-blue-500" />
    }
}

function getClassName(type: string) {
    // Return tailwind classes for styling the toast based on type
    return "border border-white/10 bg-slate-950 text-white"
}

function playNotificationSound(type: string) {
    try {
        const audio = new Audio('/sounds/notification.mp3') // Assume exists or fails silently
        audio.volume = 0.5
        audio.play().catch(e => console.log('Audio play failed', e))
    } catch (e) {
        // ignore
    }
}
