// Simulate createStaff error
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jggcixrapxccbxckuofw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZ2NpeHJhcHhjY2J4Y2t1b2Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxMjQ5NCwiZXhwIjoyMDg1MDg4NDk0fQ.9XH9gzZdNRu1zkSl4BBo5jOmSIuvdAEJGBWgLcHl-vU'

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testInsert() {
    console.log("Testing insert into message_logs...")
    const { error } = await supabaseAdmin
        .from('message_logs')
        .insert({
            tenant_id: "e18076ff-0404-41aa-a97d-c2b884753ddc",
            sender_id: "e18076ff-0404-41aa-a97d-c2b884753ddc", // fake UUID
            recipient_phone: "2348123456789",
            recipient_name: `Test User`,
            message_content: "Hello",
            channel: 'sms',
            status: 'sent',
            cost: 1,
            provider_ref: "test"
        })

    if (error) {
        console.error("Insert error:", error)
    } else {
        console.log("Insert success")
    }
}

testInsert()
