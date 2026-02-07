'use server'

import { createClient } from '@/lib/supabase/server'

export interface FinancialStats {
    totalExpected: number
    totalReceived: number
    totalOutstanding: number
    paymentMethods: { method: string; amount: number }[]
}

export interface ClassRevenue {
    className: string
    amount: number
}

export async function getBursarStats(): Promise<FinancialStats> {
    const supabase = createClient()

    // In a real app with large data, use SQL aggregation or RPC
    // For MVP/Demo, fetch basic billing records
    const { data: billing } = await supabase.from('billing').select('total_fees, amount_paid, balance')

    // Mocking Payment Method data since it wasn't in the schema explicitly previously
    // Assuming a 'payments' table linked to billing would exist.
    // For now, returning mock splits for Paystack vs Cash

    if (!billing) {
        return {
            totalExpected: 0,
            totalReceived: 0,
            totalOutstanding: 0,
            paymentMethods: []
        }
    }

    const totalExpected = billing.reduce((acc: number, curr: { total_fees?: number }) => acc + (Number(curr.total_fees) || 0), 0)
    const totalReceived = billing.reduce((acc: number, curr: { amount_paid?: number }) => acc + (Number(curr.amount_paid) || 0), 0)
    const totalOutstanding = billing.reduce((acc: number, curr: { balance?: number }) => acc + (Number(curr.balance) || 0), 0)

    return {
        totalExpected,
        totalReceived,
        totalOutstanding,
        paymentMethods: [
            { method: 'Paystack (Online)', amount: totalReceived * 0.65 },
            { method: 'Cash / Transfer', amount: totalReceived * 0.35 }
        ]
    }
}

export async function getClassRevenueStats(): Promise<ClassRevenue[]> {
    const supabase = createClient()

    // Fetch billing with class relations
    // This is expensive without aggregation, but works for demo scale
    const { data } = await supabase
        .from('billing')
        .select(`
            amount_paid,
            student:students (
                class:classes (name)
            )
        `)

    const stats: Record<string, number> = {}

    data?.forEach((record: { amount_paid?: number; student?: { class?: { name?: string } } }) => {
        const className = record.student?.class?.name || 'Unassigned'
        const paid = Number(record.amount_paid) || 0
        if (!stats[className]) stats[className] = 0
        stats[className] += paid
    })

    // Convert Object entries to array
    return Object.entries(stats).map(([className, amount]) => ({ className, amount }))
}

/**
 * Get Bursary Audit Trail Report
 */
export async function getBursaryAuditTrail(month: string, year: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1
    const monthStr = monthIndex.toString().padStart(2, '0')
    const startDate = `${year}-${monthStr}-01`
    const endDate = `${year}-${monthStr}-31`

    // 1. Fetch Statistics
    // Total Pings
    const { count: totalPings } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)
        .in('action', ['CLOCK_IN_ATTEMPT', 'FAILED_LOCATION_VERIFICATION'])
        .gte('created_at', startDate)
        .lte('created_at', endDate)

    // Geofence Failures
    const { count: geofenceFailures } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)
        .eq('action', 'FAILED_LOCATION_VERIFICATION')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

    // Geofence Success (Present records)
    const { count: geofenceSuccess } = await supabase
        .from('staff_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'present')
        .gte('date', startDate)
        .lte('date', endDate)

    // Manual Overrides
    const { count: manualOverrides } = await supabase
        .from('staff_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)
        .eq('verification_method', 'manual_override')
        .gte('date', startDate)
        .lte('date', endDate)

    // Dispute Rejections
    const { count: disputeRejections } = await supabase
        .from('staff_attendance_disputes')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'declined')
        .gte('created_at', startDate)
        .lte('created_at', endDate)

    // 2. Fetch Deviation Ledger
    const { data: deviations } = await supabase
        .from('staff_attendance')
        .select(`
            date,
            metadata,
            staff:profiles!staff_id(full_name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .eq('verification_method', 'manual_override')
        .gte('date', startDate)
        .lte('date', endDate)

    // Fetch associated dispute details for proof IDs and authorizers
    const disputeIds = deviations?.map(d => d.metadata?.dispute_id).filter(Boolean) || []
    const { data: disputeDetails } = await supabase
        .from('staff_attendance_disputes')
        .select(`
            id,
            distance_detected,
            reason,
            resolved_by_profile:profiles!resolved_by(full_name)
        `)
        .in('id', disputeIds)

    const ledger = deviations?.map(dev => {
        const dispute = disputeDetails?.find(d => d.id === dev.metadata?.dispute_id)
        return {
            date: dev.date,
            staffName: (dev.staff as any)?.full_name || "Unknown",
            deviationType: dispute?.reason || "Manual Override",
            distance: dispute?.distance_detected || dev.metadata?.original_distance || 0,
            authorizer: (dispute?.resolved_by_profile as any)?.full_name || "Admin Principal",
            proofId: `IMG_EVID_${dev.metadata?.dispute_id?.slice(0, 4).toUpperCase() || 'MOCK'}`
        }
    })

    return {
        success: true,
        data: {
            stats: {
                totalPings: totalPings || 0,
                successRate: totalPings ? ((geofenceSuccess || 0) / totalPings * 100).toFixed(1) : "0",
                geofenceFailures: geofenceFailures || 0,
                manualOverrides: manualOverrides || 0,
                disputeRejections: disputeRejections || 0
            },
            ledger: ledger || []
        }
    }
}

/**
 * Get Live Reconciliation Stats for Dashboard
 */
export async function getLiveReconciliationStats() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    // Derive current month boundaries
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endDate = now.toISOString()

    // 1. Leakage Calculation (Estimated)
    // Fetch absences and lateness count for the current month so far
    const { data: attendance } = await supabase
        .from('staff_attendance')
        .select('status, check_in_time, staff_id')
        .eq('tenant_id', profile.tenant_id)
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0])

    // Rough leakage estimation: ₦500 per late arrival, ₦5000 per absence (mocked rates for live pulse)
    const lateCount = attendance?.filter(a => {
        if (!a.check_in_time) return false
        const [h, m] = a.check_in_time.split(':').map(Number)
        return h > 8 || (h === 8 && m > 5)
    }).length || 0

    // Abstract check for absences: 20 working days expected monthly.
    // This is a complex calc, for live pulse we use a base metric
    const absences = attendance?.filter(a => a.status === 'absent').length || 0
    const estimatedLeakage = (lateCount * 500) + (absences * 5000)

    // 2. Pending Approvals
    const { count: pendingApprovals } = await supabase
        .from('staff_attendance_disputes')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'pending')

    // 3. Weekly Integrity Score
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: weekData } = await supabase
        .from('staff_attendance')
        .select('verification_method')
        .eq('tenant_id', profile.tenant_id)
        .gte('date', weekAgo.toISOString().split('T')[0])

    const totalVerified = weekData?.length || 0
    const autoVerified = weekData?.filter(a => a.verification_method === 'geofence').length || 0
    const integrityScore = totalVerified ? (autoVerified / totalVerified * 100).toFixed(1) : "100.0"

    // 4. Recent Overrides
    const { data: overrides } = await supabase
        .from('staff_attendance_disputes')
        .select(`
            id,
            reason,
            created_at,
            staff:profiles!staff_id(full_name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10)

    const recentOverrides = overrides?.map(log => ({
        id: log.id,
        staffName: (log.staff as any)?.full_name || "Unknown",
        initials: (log.staff as any)?.full_name?.split(' ').map((n: string) => n[0]).join('') || "??",
        reason: log.reason,
        timestamp: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })) || []

    return {
        success: true,
        data: {
            leakage: estimatedLeakage,
            pendingApprovals: pendingApprovals || 0,
            integrityScore: parseFloat(integrityScore),
            recentOverrides,
            trendData: [70, 85, 98, 92, 88] // Compliance trend mockup
        }
    }
}
