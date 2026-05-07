import { safeParseJSON } from "@/lib/utils"
import { SITE_CONFIG } from "@/lib/constants/site-config"

export async function sendSMS(to: string, message: string) {
    const apiKey = process.env.TERMII_API_KEY
    const senderId = process.env.TERMII_SENDER_ID || "EduFlow"
    const channel = process.env.TERMII_CHANNEL || "dnd" // Default to DND for approved IDs
    const baseUrl = process.env.TERMII_BASE_URL || 'https://v3.api.termii.com'
    const isProd = process.env.NODE_ENV === 'production'

    if (!apiKey) {
        if (isProd) {
            console.error('❌ CRITICAL: TERMII_API_KEY is missing in production. SMS delivery aborted.')
            return { success: false, error: 'SMS service not configured on server' }
        }
        console.warn('⚠️ TERMII_API_KEY not set. SMS simulated in dev.')
        console.log(`[SMS SIMULATION] To: ${to} | Msg: ${message}`)
        return { success: true, simulated: true }
    }

    // Robust Number Normalization for Nigeria (234)
    let clean = to.trim().replace(/[^0-9]/g, '') // Remove all non-digits
    
    let formattedTo = clean
    if (clean.startsWith('0') && clean.length === 11) {
        formattedTo = '234' + clean.substring(1)
    } else if (clean.length === 10) {
        formattedTo = '234' + clean
    } else if (clean.startsWith('234') && clean.length === 13) {
        formattedTo = clean
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s for reliability

    try {
        const payload = {
            to: formattedTo,
            from: senderId,
            sms: message,
            type: "plain",
            api_key: apiKey,
            channel: channel 
        }

        const url = process.env.TERMII_API_URL || `${baseUrl}/api/sms/send`
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        })

        const data = await safeParseJSON(response)

        // Termii often returns 200 OK even for failures, but includes a 'message' field
        // Typical success message is "Successfully Sent" or "Sent"
        const isSuccess = response.ok && (
            data?.message === "Successfully Sent" || 
            data?.message === "Sent" || 
            data?.code === "ok" || 
            data?.message?.toLowerCase().includes("successfully")
        )

        if (!isSuccess) {
            console.error('Termii Delivery Failure:', data)
            return { 
                success: false, 
                error: data?.message || 'SMS delivery failed at provider level',
                code: data?.code
            }
        }

        console.log(`[SMS SUCCESS] Sent to ${formattedTo} via Termii`)
        return { success: true, data }

    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('Termii SMS Request timed out')
            return { success: false, error: 'Request timed out' }
        }
        console.error('SMS Service Error:', error)
        return { success: false, error: 'Network error' }
    } finally {
        clearTimeout(timeout)
    }
}

export async function getWalletBalance() {
    const apiKey = process.env.TERMII_API_KEY
    const baseUrl = process.env.TERMII_BASE_URL || 'https://v3.api.termii.com'

    if (!apiKey) {
        console.warn('⚠️ TERMII_API_KEY not set. Using mock balance.')
        return { success: true, balance: 2450.00, currency: 'NGN', simulated: true }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
        const response = await fetch(`${baseUrl}/api/get-balance?api_key=${apiKey}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
        })

        const data = await safeParseJSON(response)

        if (!response.ok) {
            console.error('Termii Balance API Error:', data)
            return { success: false, error: data.message || 'Failed to fetch balance' }
        }

        return {
            success: true,
            balance: Number((data as any).balance || 0),
            currency: (data as any).currency || 'NGN'
        }

    } catch (error: any) {
        if (error.name === 'AbortError') {
            return { success: false, error: 'Balance request timed out' }
        }
        console.error('Termii Service Error:', error)
        return { success: false, error: 'Network error' }
    } finally {
        clearTimeout(timeout)
    }
}
