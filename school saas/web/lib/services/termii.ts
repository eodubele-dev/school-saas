import { safeParseJSON } from "@/lib/utils"

export async function sendSMS(to: string, message: string) {
    const apiKey = process.env.TERMII_API_KEY
    const senderId = process.env.TERMII_SENDER_ID || 'EduFlow'
    const baseUrl = process.env.TERMII_BASE_URL || 'https://api.ng.termii.com'

    if (!apiKey) {
        console.warn('⚠️ TERMII_API_KEY not set. SMS simulated.')
        console.log(`[SMS SIMULATION] To: ${to} | Msg: ${message}`)
        return { success: true, simulated: true }
    }

    // Format Number: Ensure it starts with 234, remove leading 0
    let formattedTo = to.trim()
    if (formattedTo.startsWith('0')) {
        formattedTo = '234' + formattedTo.substring(1)
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
        const payload = {
            to: formattedTo,
            from: senderId,
            sms: message,
            type: "plain",
            api_key: apiKey,
            channel: "generic"
        }

        const response = await fetch(`${baseUrl}/api/sms/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        })

        const data = await safeParseJSON(response)

        if (!response.ok) {
            console.error('Termii API Error:', data)
            return { success: false, error: data.message || 'SMS failed' }
        }

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
    const baseUrl = process.env.TERMII_BASE_URL || 'https://api.ng.termii.com'

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
