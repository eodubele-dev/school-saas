/**
 * SIMULATED Notification Channels
 * In production, these would wrap Termii (SMS) and Resend (Email) APIs.
 */

interface SMSPayload {
    to: string
    message: string
}

interface EmailPayload {
    to: string
    subject: string
    html: string
}

export const ChannelSimulator = {
    sms: async (payload: SMSPayload) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log("---------------------------------------------------")
        console.log("📱 [SMS SENT SIMULATION] via Termii")
        console.log(`To: ${payload.to}`)
        console.log(`Message: ${payload.message}`)
        console.log("---------------------------------------------------")

        // Return a fake provider ID
        return { success: true, providerId: `termii_mx_${Date.now()}` }
    },

    email: async (payload: EmailPayload) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))

        console.log("---------------------------------------------------")
        console.log("📧 [EMAIL SENT SIMULATION] via Resend")
        console.log(`To: ${payload.to}`)
        console.log(`Subject: ${payload.subject}`)
        console.log(`HTML Preview: ${payload.html.substring(0, 100)}...`)
        console.log("---------------------------------------------------")

        return { success: true, providerId: `resend_id_${Date.now()}` }
    }
}
