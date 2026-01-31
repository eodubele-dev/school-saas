/**
 * Termii Onboarding Script
 * 
 * Usage: npx tsx scripts/onboard-parents.ts
 * 
 * This script fetches all parents/students and sends a "Welcome" SMS
 * with the new platform URL.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js"
import fetch from "node-fetch"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Or Service Role Key for Admin
const TERMII_API_KEY = process.env.TERMII_API_KEY!
const TERMII_SENDER_ID = "EduFlow"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function onboardParents() {
    console.log("🚀 Starting Bulk Onboarding...")

    // 1. Fetch Students/Parents (Phone Numbers)
    // Assuming 'guardians' table or 'student' has phone_number
    // For demo, using 'students' table assuming parent_phone column exists or using student phone
    const { data: students, error } = await supabase
        .from('students')
        .select(`
            full_name, 
            parent_phone, 
            class:classes(name)
        `)
        .not('parent_phone', 'is', null)

    if (error || !students) {
        console.error("❌ Failed to fetch students:", error)
        return
    }

    console.log(`📋 Found ${students.length} students with parent phone numbers.`)

    // 2. Loop and Send SMS
    for (const student of students) {
        const phone = student.parent_phone
        // Ensure international format 234...
        const formattedPhone = phone.startsWith('0') ? '234' + phone.substring(1) : phone

        const message = `Welcome to EduFlow! 🚀\nYour child ${student.full_name}'s results & attendance are now live.\nLogin here: https://eduflow.ng`

        await sendSMS(formattedPhone, message)
    }

    console.log("✅ Onboarding Blast Complete!")
}

async function sendSMS(to: string, message: string) {
    if (!TERMII_API_KEY) {
        console.log(`[Mock SMS] To: ${to} | Msg: ${message}`)
        return
    }

    try {
        const payload = {
            "to": to,
            "from": TERMII_SENDER_ID,
            "sms": message,
            "type": "plain",
            "channel": "generic",
            "api_key": TERMII_API_KEY,
        }

        const response = await fetch("https://api.ng.termii.com/api/sms/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        const result: any = await response.json()
        console.log(`[Termii] ${to}: ${result.message || 'Sent'}`)
    } catch (e) {
        console.error(`[Termii Error] Failed to send to ${to}`, e)
    }
}

onboardParents()
