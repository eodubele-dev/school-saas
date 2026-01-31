// Termii SMS Service
// Handles sending SMS notifications via Termii API

interface TermiiSMSPayload {
    to: string
    from: string
    sms: string
    type: 'plain'
    channel: 'dnd'  // DND channel for bypassing Do Not Disturb in Nigeria
    api_key: string
}

interface TermiiResponse {
    message_id?: string
    message: string
    balance?: number
    user?: string
}

export class TermiiService {
    private apiKey: string
    private senderId: string
    private apiUrl: string

    constructor() {
        this.apiKey = process.env.TERMII_API_KEY || ''
        this.senderId = process.env.TERMII_SENDER_ID || 'SchoolApp'
        this.apiUrl = process.env.TERMII_API_URL || 'https://api.ng.termii.com/api/sms/send'

        if (!this.apiKey) {
            console.warn('⚠️ TERMII_API_KEY not configured. SMS sending will fail.')
        }
    }

    /**
     * Send SMS to a single recipient
     */
    async sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            // Validate phone number (Nigerian format)
            const cleanPhone = this.formatPhoneNumber(phoneNumber)
            if (!cleanPhone) {
                return { success: false, error: 'Invalid phone number format' }
            }

            const payload: TermiiSMSPayload = {
                to: cleanPhone,
                from: this.senderId,
                sms: message,
                type: 'plain',
                channel: 'dnd',  // DND channel bypasses Do Not Disturb
                api_key: this.apiKey
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const data: TermiiResponse = await response.json()

            if (response.ok && data.message_id) {
                console.log(`✅ SMS sent successfully to ${cleanPhone}. Message ID: ${data.message_id}`)
                return { success: true, messageId: data.message_id }
            } else {
                console.error(`❌ SMS failed to ${cleanPhone}:`, data.message)
                return { success: false, error: data.message }
            }
        } catch (error) {
            console.error('❌ SMS sending error:', error)
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }

    /**
     * Send bulk SMS (with rate limiting)
     */
    async sendBulkSMS(recipients: Array<{ phone: string; message: string }>): Promise<{
        sent: number
        failed: number
        results: Array<{ phone: string; success: boolean; error?: string }>
    }> {
        const results: Array<{ phone: string; success: boolean; error?: string }> = []
        let sent = 0
        let failed = 0

        // Rate limiting: 10 SMS per second
        const batchSize = 10
        const delayMs = 1000

        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize)

            const batchPromises = batch.map(async ({ phone, message }) => {
                const result = await this.sendSMS(phone, message)
                if (result.success) {
                    sent++
                } else {
                    failed++
                }
                return { phone, ...result }
            })

            const batchResults = await Promise.all(batchPromises)
            results.push(...batchResults)

            // Delay between batches
            if (i + batchSize < recipients.length) {
                await this.delay(delayMs)
            }
        }

        return { sent, failed, results }
    }

    /**
     * Format phone number to international format
     * Supports Nigerian numbers (234...)
     */
    private formatPhoneNumber(phone: string): string | null {
        // Remove all non-numeric characters
        const cleaned = phone.replace(/\D/g, '')

        // Nigerian number formats:
        // 08012345678 -> 2348012345678
        // 2348012345678 -> 2348012345678
        // +2348012345678 -> 2348012345678

        if (cleaned.startsWith('234') && cleaned.length === 13) {
            return cleaned
        }

        if (cleaned.startsWith('0') && cleaned.length === 11) {
            return '234' + cleaned.substring(1)
        }

        // Invalid format
        return null
    }

    /**
     * Helper to delay execution
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * Generate absence notification message
     */
    static generateAbsenceMessage(studentName: string, date: string, schoolName: string): string {
        return `Dear Parent, ${studentName} was marked absent on ${date}. Please contact ${schoolName} if this is incorrect. Thank you.`
    }

    /**
     * Generate late arrival message
     */
    static generateLateMessage(studentName: string, date: string, schoolName: string): string {
        return `Dear Parent, ${studentName} arrived late to school on ${date}. Please ensure punctuality. Thank you. - ${schoolName}`
    }
}

// Singleton instance
export const termiiService = new TermiiService()
