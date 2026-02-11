'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface NotificationSettings {
    // Financial & Revenue
    fee_reminders: boolean
    payment_confirmations: boolean
    outstanding_balance_alerts: boolean

    // Safety & Attendance
    attendance_clock_in: boolean
    attendance_clock_out: boolean
    absence_alerts: boolean

    // Academic
    result_published: boolean
    grade_updates: boolean
    assignment_reminders: boolean

    // Logistics
    bus_arrival_alerts: boolean
    bus_departure_alerts: boolean
    maintenance_updates: boolean

    // System Critical (read-only)
    security_alerts: boolean
    forensic_grade_changes: boolean
}

/**
 * Get Notification Settings
 * Fetches current SMS notification preferences for the tenant
 */
export async function getNotificationSettings() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized', settings: null }

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, role')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'proprietor', 'bursar', 'owner'].includes(profile.role)) {
            return { success: false, error: 'Insufficient permissions', settings: null }
        }

        const { data: settings, error } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .single()

        if (error && error.code !== 'PGRST116') throw error

        if (!settings) {
            // Initialize defaults
            const { data: newSettings, error: createError } = await supabase
                .from('notification_settings')
                .insert({ tenant_id: profile.tenant_id })
                .select()
                .single()

            if (createError) throw createError
            return { success: true, settings: newSettings }
        }

        return { success: true, settings }
    } catch (error: any) {
        console.error('Error fetching notification settings:', error)
        return { success: false, error: error.message, settings: null }
    }
}

/**
 * Update Notification Settings
 * Updates SMS notification preferences (except system-critical alerts)
 */
export async function updateNotificationSettings(updates: Partial<NotificationSettings>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, role')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'proprietor', 'owner'].includes(profile.role)) {
            return { success: false, error: 'Only admins can modify notification settings' }
        }

        // Ensure critical alerts cannot be disabled
        const safeUpdates = {
            ...updates,
            security_alerts: true,
            forensic_grade_changes: true,
            updated_by: user.id,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('notification_settings')
            .update(safeUpdates)
            .eq('tenant_id', profile.tenant_id)

        if (error) throw error

        revalidatePath('/dashboard/settings/notifications')

        return { success: true }
    } catch (error: any) {
        console.error('Error updating notification settings:', error)
        return { success: false, error: error.message }
    }
}

import { SMS_CONFIG } from '@/lib/constants/communication'

/**
 * Get Monthly SMS Volume Estimates
 * Calculates estimated monthly SMS volume based on current settings
 */
export async function getMonthlyVolumeEstimates() {
    return SMS_CONFIG.ESTIMATES
}
