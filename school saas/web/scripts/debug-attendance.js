
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAttendance() {
    const today = new Date().toISOString().split('T')[0]
    console.log('Checking attendance for:', today)

    // 1. Get all registers (limit 10 for safety)
    const { data: registers, error: regError } = await supabase
        .from('attendance_registers')
        .select(`
            id, 
            date, 
            class_id,
            classes (name, form_teacher_id)
        `)
        .order('date', { ascending: false })
        .limit(10)

    if (regError) {
        console.error('Error fetching registers:', regError)
        return
    }

    console.log('Total Registers Found (Last 10):', registers?.length)
    if (registers && registers.length > 0) {
        registers.forEach(r => {
            console.log(`- Date: ${r.date}, Register: ${r.id}, Class: ${r.classes?.name}, Teacher ID: ${r.classes?.form_teacher_id}`)
        })
    } else {
        console.log('No registers found in the database.')
    }

    // 2. Get all student attendance for today (via registers)
    if (registers && registers.length > 0) {
        const registerIds = registers.map(r => r.id)
        const { data: attendance, error: attError } = await supabase
            .from('student_attendance')
            .select('*')
            .in('register_id', registerIds)

        if (attError) {
            console.error('Error fetching attendance:', attError)
            return
        }

        console.log('Attendance Records Found:', attendance?.length)
        if (attendance && attendance.length > 0) {
            const statusCounts = attendance.reduce((acc, curr) => {
                acc[curr.status] = (acc[curr.status] || 0) + 1
                return acc
            }, {})
            console.log('Status Counts:', statusCounts)
        }
    }
}

debugAttendance()
