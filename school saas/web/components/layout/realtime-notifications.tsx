'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Bell, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePreferencesStore } from '@/lib/stores/preferences-store'
import { PulseNotifier } from '@/lib/utils/pulse-notifier'

export function RealtimeNotifications() {
    const supabase = createClient()
    const router = useRouter()
    const preferences = usePreferencesStore()

    useEffect(() => {
        let userId: string | null = null

        const setup = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            userId = user?.id || null
        }
        setup()

        const channel = supabase
            .channel('global-notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    const notif = payload.new as any

                    // 1. Security Check: Only show if it's for this user
                    if (userId && notif.user_id !== userId) return

                    // 2. Preferences Check: Respect the Notification Matrix (in_app)
                    const inAppPrefs = preferences.notifications.in_app as any
                    if (notif.type === 'academic' && inAppPrefs?.academic === false) return
                    if (notif.type === 'financial' && inAppPrefs?.financial === false) return
                    if (notif.type === 'security' && inAppPrefs?.security === false) return
                    // Emergency & System bypass filters

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
                        className: "border border-border bg-slate-950 text-foreground shadow-2xl"
                    })

                    // 3. Native Pulse Alert for Critical Types
                    if (notif.type === 'emergency' || notif.type === 'security') {
                        PulseNotifier.notify({
                            title: notif.title,
                            body: notif.message,
                            category: notif.type as any
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router, preferences.notifications.in_app])

    return null
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
    return "border border-border bg-slate-950 text-foreground"
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
