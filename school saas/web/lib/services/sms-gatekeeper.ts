'use server'

import { createClient } from '@/lib/supabase/server'
import { logSMSTransaction, updateSMSTransactionStatus } from '@/lib/actions/sms'

/**
 * SMS Event Types
 * Maps to notification_settings table columns
 */
export type SMSEventType =
    | 'fee_reminders'
    | 'payment_confirmations'
    | 'outstanding_balance_alerts'
    | 'attendance_clock_in'
    | 'attendance_clock_out'
    | 'absence_alerts'
    | 'result_published'
    | 'grade_updates'
    | 'assignment_reminders'
    | 'bus_arrival_alerts'
    | 'bus_departure_alerts'
    | 'maintenance_updates'
    | 'security_alerts'
    | 'forensic_grade_changes'

/**
 * SMS Dispatch Result
 */
interface SMSDispatchResult {
    status: 'SENT' | 'SKIPPED' | 'FAILED'
    reason?: string
    transactionId?: string
    cost?: number
}

/**
 * SMS Gatekeeper Service
 * Enforces notification settings and wallet balance before sending SMS
 * 
 * This service acts as a filter between your application logic and the SMS gateway,
 * ensuring institutional discipline and forensic precision.
 */
export class SMSGatekeeperService {
    /**
     * System-Critical Events
     * These bypass notification settings and always send
     */
    private static readonly CRITICAL_EVENTS: SMSEventType[] = [
        'security_alerts',
        'forensic_grade_changes'
    ]

    /**
     * Send Automated SMS with Gatekeeper Logic
     * 
     * @param eventType - Type of notification event
     * @param recipientName - Name of recipient (parent/staff)
     * @param recipientPhone - Phone number
     * @param message - SMS content
     * @param metadata - Additional context for logging
     */
    static async sendAutomatedSMS(
        eventType: SMSEventType,
        recipientName: string,
        recipientPhone: string,
        message: string,
        metadata?: Record<string, any>
    ): Promise<SMSDispatchResult> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { status: 'FAILED', reason: 'UNAUTHORIZED' }
        }

        try {
            // 1. Get tenant and notification settings
            const { data: profile } = await supabase
                .from('profiles')
                .select('tenant_id')
                .eq('id', user.id)
                .single()

            if (!profile) {
                return { status: 'FAILED', reason: 'PROFILE_NOT_FOUND' }
            }

            // Fetch tenant with balance and notification settings
            const { data: tenant } = await supabase
                .from('tenants')
                .select('id, name, sms_balance')
                .eq('id', profile.tenant_id)
                .single()

            const { data: settings } = await supabase
                .from('notification_settings')
                .select('*')
                .eq('tenant_id', profile.tenant_id)
                .single()

            if (!tenant || !settings) {
                return { status: 'FAILED', reason: 'TENANT_CONFIG_NOT_FOUND' }
            }

            // 2. The "Platinum Guard" Logic
            const isCritical = this.CRITICAL_EVENTS.includes(eventType)
            const isEnabled = settings[eventType] === true

            // Skip if not critical and disabled by user
            if (!isCritical && !isEnabled) {
                console.log(`[SMS Gatekeeper] SKIPPED: ${eventType} is disabled for ${tenant.name}`)

                // Log the skip for audit purposes (optional)
                await this.logSkippedNotification(
                    profile.tenant_id,
                    eventType,
                    recipientName,
                    recipientPhone,
                    'USER_CONFIG_DISABLED'
                )

                return {
                    status: 'SKIPPED',
                    reason: 'USER_CONFIG_DISABLED'
                }
            }

            // 3. Wallet Balance Check
            const smsCost = 5.00 // Standard SMS cost
            if (tenant.sms_balance < smsCost) {
                console.warn(`[SMS Gatekeeper] FAILED: Insufficient funds for ${tenant.name}`)

                return {
                    status: 'FAILED',
                    reason: 'INSUFFICIENT_FUNDS',
                    cost: smsCost
                }
            }

            // 4. Execute SMS Dispatch
            const result = await this.executeSMSDispatch(
                profile.tenant_id,
                eventType,
                recipientName,
                recipientPhone,
                message,
                smsCost,
                metadata
            )

            return result

        } catch (error: any) {
            console.error('[SMS Gatekeeper] Error:', error)
            return {
                status: 'FAILED',
                reason: error.message
            }
        }
    }

    /**
     * Execute SMS Dispatch
     * Logs transaction and integrates with SMS gateway
     */
    private static async executeSMSDispatch(
        tenantId: string,
        eventType: SMSEventType,
        recipientName: string,
        recipientPhone: string,
        message: string,
        cost: number,
        metadata?: Record<string, any>
    ): Promise<SMSDispatchResult> {
        try {
            // Log the transaction (this will auto-deduct from wallet via trigger)
            const logResult = await logSMSTransaction({
                recipientName,
                recipientPhone,
                messageType: eventType,
                messageContent: message,
                cost
            })

            if (!logResult.success) {
                return {
                    status: 'FAILED',
                    reason: logResult.error || 'TRANSACTION_LOG_FAILED'
                }
            }

            // TODO: Integrate with actual SMS gateway (Termii, AfricasTalking, etc.)
            // For now, we simulate successful dispatch
            const gatewayResult = await this.sendToSMSGateway(
                recipientPhone,
                message,
                metadata
            )

            if (gatewayResult.success) {
                console.log(`[SMS Gatekeeper] SENT: ${eventType} to ${recipientName} (${recipientPhone})`)

                // Update transaction status to delivered
                await updateSMSTransactionStatus(logResult.id, 'delivered', gatewayResult.messageId)

                return {
                    status: 'SENT',
                    cost,
                    transactionId: gatewayResult.messageId
                }
            } else {
                // Update transaction status to failed
                await updateSMSTransactionStatus(logResult.id, 'failed', undefined, gatewayResult.error)

                return {
                    status: 'FAILED',
                    reason: gatewayResult.error || 'GATEWAY_ERROR'
                }
            }

        } catch (error: any) {
            console.error('[SMS Gatekeeper] Dispatch error:', error)
            return {
                status: 'FAILED',
                reason: error.message
            }
        }
    }

    /**
     * Send to SMS Gateway (Termii Integration)
     * Fully wired for production with live credentials
     */
    private static async sendToSMSGateway(
        phone: string,
        message: string,
        metadata?: Record<string, any>
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        const apiKey = process.env.TERMII_API_KEY
        const senderId = process.env.TERMII_SENDER_ID || 'Eduflow'
        const apiUrl = process.env.TERMII_API_URL || 'https://api.ng.termii.com/api/sms/send'

        if (!apiKey) {
            console.error('[SMS Gateway] TERMII_API_KEY is missing')
            return { success: false, error: 'API_KEY_MISSING' }
        }

        // Clean and format phone number (ensure 234 prefix for Nigeria)
        let formattedPhone = phone.replace(/\s+/g, '').replace('+', '')
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '234' + formattedPhone.substring(1)
        } else if (!formattedPhone.startsWith('234')) {
            formattedPhone = '234' + formattedPhone
        }

        console.log(`[SMS Gateway] Dispatching to ${formattedPhone} via Termii...`)

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: formattedPhone,
                    from: senderId,
                    sms: message,
                    type: 'plain',
                    channel: 'generic',
                    api_key: apiKey
                })
            })

            const data = await response.json()

            if (response.ok && data.message_id) {
                console.log(`[SMS Gateway] SUCCESS: Message ID ${data.message_id}`)
                return {
                    success: true,
                    messageId: data.message_id
                }
            } else {
                console.error(`[SMS Gateway] FAILED:`, data)
                return {
                    success: false,
                    error: data.message || 'GATEWAY_REJECTED'
                }
            }
        } catch (error: any) {
            console.error(`[SMS Gateway] NETWORK_ERROR:`, error)
            return {
                success: false,
                error: error.message || 'CONNECTION_FAILED'
            }
        }
    }

    /**
     * Log Skipped Notification
     * Records when a notification was skipped due to user settings
     */
    private static async logSkippedNotification(
        tenantId: string,
        eventType: SMSEventType,
        recipientName: string,
        recipientPhone: string,
        reason: string
    ) {
        const supabase = createClient()

        // Optional: Create a separate table for skipped notifications
        // This helps schools see how much they're saving
        try {
            await supabase
                .from('sms_skipped_log')
                .insert({
                    tenant_id: tenantId,
                    event_type: eventType,
                    recipient_name: recipientName,
                    recipient_phone: recipientPhone,
                    reason,
                    skipped_at: new Date().toISOString()
                })
        } catch (error) {
            // Silently fail - this is just for analytics
            console.log('[SMS Gatekeeper] Could not log skipped notification:', error)
        }
    }
}

/**
 * Convenience wrapper for common use cases
 */
export async function sendFeeReminder(parentName: string, parentPhone: string, amount: number, dueDate: string) {
    return SMSGatekeeperService.sendAutomatedSMS(
        'fee_reminders',
        parentName,
        parentPhone,
        `Dear ${parentName}, your child's school fees of ₦${amount.toLocaleString()} are due on ${dueDate}. Pay now: [PAYMENT_LINK]`,
        { amount, dueDate }
    )
}

export async function sendAttendanceAlert(parentName: string, parentPhone: string, studentName: string, action: 'clock_in' | 'clock_out') {
    const eventType = action === 'clock_in' ? 'attendance_clock_in' : 'attendance_clock_out'
    const actionText = action === 'clock_in' ? 'arrived at' : 'left'

    return SMSGatekeeperService.sendAutomatedSMS(
        eventType,
        parentName,
        parentPhone,
        `Dear ${parentName}, ${studentName} has ${actionText} school at ${new Date().toLocaleTimeString()}.`,
        { studentName, action, timestamp: new Date().toISOString() }
    )
}

export async function sendSecurityAlert(recipientName: string, recipientPhone: string, alertMessage: string) {
    // Security alerts are ALWAYS sent (critical event)
    return SMSGatekeeperService.sendAutomatedSMS(
        'security_alerts',
        recipientName,
        recipientPhone,
        `SECURITY ALERT: ${alertMessage}`,
        { priority: 'CRITICAL' }
    )
}

export async function sendForensicGradeChangeAlert(recipientName: string, recipientPhone: string, studentName: string, subject: string, oldGrade: string, newGrade: string, changedBy: string) {
    // Forensic alerts are ALWAYS sent (critical event)
    return SMSGatekeeperService.sendAutomatedSMS(
        'forensic_grade_changes',
        recipientName,
        recipientPhone,
        `GRADE CHANGE ALERT: ${studentName}'s ${subject} grade changed from ${oldGrade} to ${newGrade} by ${changedBy}. This is a forensic audit notification.`,
        { studentName, subject, oldGrade, newGrade, changedBy }
    )
}
