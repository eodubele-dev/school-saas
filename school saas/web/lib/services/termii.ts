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
