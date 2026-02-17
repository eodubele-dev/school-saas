
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

        // 1. Check get_auth_tenant_id()
        const { data: rpcTenantId, error: rpcError } = await supabase.rpc('get_auth_tenant_id')

        // 2. Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

        // 3. Registers for Today
        const { data: registersToday, error: regError } = await supabase
            .from('attendance_registers')
            .select('*, classes(name)')
            .eq('date', date)

        // 4. Counts without RLS (Diagnostic - if we have service role we'd do it there, but here we see what the teacher sees)
        const { count: attCountDirect } = await supabase
            .from('student_attendance')
            .select('*', { count: 'exact', head: true })

        const { count: regCountDirect } = await supabase
            .from('attendance_registers')
            .select('*', { count: 'exact', head: true })

        // 5. Timetable for Today
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const currentDay = days[new Date().getDay()]
        const { data: timetable } = await supabase
            .from('timetables')
            .select('*, classes(name)')
            .eq('teacher_id', user.id)
            .ilike('day_of_week', currentDay)

        // 6. Assignments Count
        const { count: assignCount } = await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })

        return NextResponse.json({
            diagnostics: {
                serverTime: new Date().toISOString(),
                requestedDate: date,
                currentDay,
                rpcTenantId,
                rpcError,
                profileTenantId: profile?.tenant_id,
                totalAttendanceInDB_Visible: attCountDirect,
                totalRegistersInDB_Visible: regCountDirect,
                totalAssignmentsInDB_Visible: assignCount
            },
            profile,
            registersToday,
            regError,
            timetable
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
