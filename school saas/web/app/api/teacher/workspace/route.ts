import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get Teacher Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        const now = new Date()
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const currentDay = days[now.getDay()]
        const currentTime = now.toTimeString().split(' ')[0] // HH:mm:ss
        const today = now.toISOString().split('T')[0]

        // 2. Resolve Active Session from Timetable
        const { data: activeSession } = await supabase
            .from('timetables')
            .select(`
                *,
                classes (id, name, grade_level),
                subjects (id, name)
            `)
            .eq('teacher_id', user.id)
            .eq('day_of_week', currentDay)
            .lte('start_time', currentTime)
            .gte('end_time', currentTime)
            .maybeSingle()

        // 3. Get Assigned Classes (Backup/Context)
        const { data: classes } = await supabase
            .from('classes')
            .select('*, students(count)')
            .eq('tenant_id', profile?.tenant_id)
            .limit(5)

        // 4. Attendance Vitals (Present/Absent counts for today, filtered by Active Class)
        // We first resolve the activeClass to use its ID for filtering
        // @ts-ignore
        const resolvedActiveClass = activeSession?.classes || classes?.[0]

        const { data: attendanceData } = await supabase
            .from('student_attendance')
            .select('status')
            .eq('date', today)
            .eq('tenant_id', profile?.tenant_id)
            .eq('register:attendance_registers!inner(class_id)', resolvedActiveClass?.id)

        const presentCount = attendanceData?.filter(a => a.status === 'present').length || 0
        const absentCount = attendanceData?.filter(a => a.status === 'absent').length || 0
        const lateCount = attendanceData?.filter(a => a.status === 'late').length || 0

        // 5. Upcoming Lessons (Tenant & Teacher isolated)
        const { data: upcomingLessons } = await supabase
            .from('lesson_plans')
            .select('*')
            .eq('tenant_id', profile?.tenant_id)
            .eq('teacher_id', user.id)
            .gte('date', today)
            .order('date', { ascending: true })
            .limit(5)

        // 6. Metrics 
        // Pending Assignments: Count where grade is null AND teacher owns the assignment
        const { count: pendingAssignments } = await supabase
            .from('assignment_submissions')
            .select('*, assignments!inner(teacher_id)', { count: 'exact', head: true })
            .eq('assignments.teacher_id', user.id)
            .is('grade', null)

        // Upcoming Exams: Count from cbt_quizzes that are active and scheduled in the future
        const { count: upcomingExams } = await supabase
            .from('cbt_quizzes')
            .select('*', { count: 'exact', head: true })
            .eq('teacher_id', user.id)
            .eq('is_active', true)
            .gte('scheduled_at', now.toISOString())

        // 7. Dynamic Avg Attendance (Simple Class Average for today or last 7 days)
        const { data: classAttendanceVitals } = await supabase
            .from('student_attendance')
            .select('status')
            .eq('tenant_id', profile?.tenant_id)
            .eq('register:attendance_registers!inner(class_id)', resolvedActiveClass?.id)
            .gte('date', new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0])

        const totalRecords = classAttendanceVitals?.length || 0
        const presentRecords = classAttendanceVitals?.filter(a => a.status === 'present').length || 0
        const calculatedAvg = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0

        // Final Data Construction
        // @ts-ignore - Supabase nested selection types
        const activeClass = activeSession?.classes || classes?.[0] || { name: 'Laboratory A', grade_level: 'Senior Sec' }
        // @ts-ignore
        const activeSubject = activeSession?.subjects?.name || "No Active Session"

        return NextResponse.json({
            profile,
            activeClass: {
                ...activeClass,
                subject: activeSubject,
                // @ts-ignore
                start_time: activeSession?.start_time,
                // @ts-ignore
                end_time: activeSession?.end_time
            },
            vitals: {
                present: presentCount,
                absent: absentCount,
                avgAttendance: calculatedAvg
            },
            metrics: {
                pendingAssignments: pendingAssignments || 0,
                upcomingExams: upcomingExams || 0,
            },
            upcomingLessons: upcomingLessons || []
        })

    } catch (error) {
        console.error('Teacher Workspace API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
