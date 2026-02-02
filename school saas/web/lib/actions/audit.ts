'use server'

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export type AuditLog = {
    id: string
    actor_name: string
    actor_role: string
    action: string
    category: 'Financial' | 'Academic' | 'System' | 'Security'
    entity_type: string
    details: string
    metadata: any
    old_values?: any
    new_values?: any
    created_at: string
}

export async function getAuditLogs(
    domain: string,
    filters: {
        page?: number
        query?: string
        category?: string
        action?: string
    } = {}
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Admin Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { success: false, error: "Access Denied" }
    }

    const PAGE_SIZE = 20
    const page = filters.page || 1
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let dbQuery = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })
        .range(from, to)

    if (filters.category && filters.category !== 'all') {
        dbQuery = dbQuery.eq('category', filters.category)
    }

    if (filters.query) {
        dbQuery = dbQuery.or(`details.ilike.%${filters.query}%,actor_name.ilike.%${filters.query}%`)
    }

    const { data, count, error } = await dbQuery

    if (error) {
        console.error("Audit Fetch Error:", error)
        return { success: false, error: "Failed to fetch logs" }
    }

    return {
        success: true,
        data: data as AuditLog[],
        count,
        totalPages: count ? Math.ceil(count / PAGE_SIZE) : 0
    }
}

export async function logActivity(
    category: 'Financial' | 'Academic' | 'System' | 'Security',
    action: string,
    details: string,
    entityType: string,
    entityId?: string,
    oldValues?: any,
    newValues?: any
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return // Fail silently if no user (should rely on RLS/Auth)

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, full_name, role')
            .eq('id', user.id)
            .single()

        if (!profile) return

        // Capture Metadata
        const headersList = headers()
        const ip = headersList.get('x-forwarded-for') || 'Unknown IP'
        const userAgent = headersList.get('user-agent') || 'Unknown Device'

        await supabase.from('audit_logs').insert({
            tenant_id: profile.tenant_id,
            actor_id: user.id,
            actor_name: profile.full_name,
            actor_role: profile.role,
            category,
            action,
            details,
            entity_type: entityType,
            entity_id: entityId,
            old_values: oldValues,
            new_values: newValues,
            metadata: {
                ip,
                user_agent: userAgent
            }
        })
    } catch (error) {
        console.error("Audit Log Error:", error)
        // We generally don't want to crash the main app if logging fails, 
        // but for high security app, maybe we should?
        // For now, log to console.
    }
}
