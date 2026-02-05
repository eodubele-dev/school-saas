'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Fetch SMS Transaction History
 * Returns the last 50 SMS transactions for forensic audit
 */
export async function getSMSTransactions(limit: number = 50) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized', transactions: [] }

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, role')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'proprietor', 'bursar'].includes(profile.role)) {
            return { success: false, error: 'Insufficient permissions', transactions: [] }
        }

        const { data: transactions, error } = await supabase
            .from('sms_transactions')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .order('sent_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        // Transform for frontend
        const formatted = transactions?.map(tx => ({
            id: tx.id,
            parentName: tx.recipient_name,
            phone: tx.recipient_phone,
            type: tx.message_type.replace(/_/g, ' ').toUpperCase(),
            status: tx.status.charAt(0).toUpperCase() + tx.status.slice(1) as 'Delivered' | 'Pending' | 'Failed',
            cost: parseFloat(tx.cost),
            timestamp: tx.sent_at
        })) || []

        return { success: true, transactions: formatted }
    } catch (error: any) {
        console.error('Error fetching SMS transactions:', error)
        return { success: false, error: error.message, transactions: [] }
    }
}

/**
 * Log SMS Transaction
 * Records a new SMS send attempt for forensic tracking
 */
export async function logSMSTransaction(data: {
    recipientName: string
    recipientPhone: string
    messageType: string
    messageContent?: string
    cost?: number
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile) throw new Error('Profile not found')

        // Check SMS balance before logging transaction
        const cost = data.cost || 5.00
        const { data: tenant } = await supabase
            .from('tenants')
            .select('sms_balance')
            .eq('id', profile.tenant_id)
            .single()

        if (!tenant || tenant.sms_balance < cost) {
            return {
                success: false,
                error: 'Insufficient SMS balance. Please top up your wallet.',
                balanceRequired: cost,
                currentBalance: tenant?.sms_balance || 0
            }
        }

        // Log the transaction (trigger will auto-deduct from wallet)
        const { error } = await supabase
            .from('sms_transactions')
            .insert({
                tenant_id: profile.tenant_id,
                recipient_name: data.recipientName,
                recipient_phone: data.recipientPhone,
                message_type: data.messageType,
                message_content: data.messageContent,
                cost: cost,
                sent_by: user.id,
                status: 'pending'
            })

        if (error) throw error

        return { success: true, cost, newBalance: tenant.sms_balance - cost }
    } catch (error: any) {
        console.error('Error logging SMS transaction:', error)
        return { success: false, error: error.message }
    }
}
