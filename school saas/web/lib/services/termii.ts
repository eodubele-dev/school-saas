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

    try {
        const payload = {
            to: formattedTo,
            from: senderId,
            sms: message,
            type: "plain",
            api_key: apiKey,
            channel: "generic" // or "dnd" depending on plan
        }

        const response = await fetch(`${baseUrl}/api/sms/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Termii API Error:', data)
            return { success: false, error: data.message || 'SMS failed' }
        }

        return { success: true, data }

    } catch (error) {
        console.error('SMS Service Error:', error)
        return { success: false, error: 'Network error' }
    }
}

export async function getWalletBalance() {
    const apiKey = process.env.TERMII_API_KEY
    const baseUrl = process.env.TERMII_BASE_URL || 'https://api.ng.termii.com'

    if (!apiKey) {
        console.warn('⚠️ TERMII_API_KEY not set. Using mock balance.')
        return { success: true, balance: 2450.00, currency: 'NGN', simulated: true }
    }

    try {
        const response = await fetch(`${baseUrl}/api/get-balance?api_key=${apiKey}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Termii Balance API Error:', data)
            return { success: false, error: data.message || 'Failed to fetch balance' }
        }

        // Termii response format: { "user": "...", "balance": 4050, "currency": "NGN" }
        return {
            success: true,
            balance: Number(data.balance),
            currency: data.currency
        }

    } catch (error) {
        console.error('Termii Service Error:', error)
        return { success: false, error: 'Network error' }
    }
}
