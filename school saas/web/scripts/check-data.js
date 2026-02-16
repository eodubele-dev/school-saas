
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
    const today = new Date().toISOString().split('T')[0]
    console.log('Checking for date:', today)

    const { data: registers } = await supabase
        .from('attendance_registers')
        .select('*')
        .eq('date', today)

    console.log('Registers for today:', registers?.length)
    if (registers && registers.length > 0) {
        const { count } = await supabase
            .from('student_attendance')
            .select('*', { count: 'exact', head: true })
            .in('register_id', registers.map(r => r.id))

        console.log('Student Attendance Records:', count)
    }
}

checkData()
