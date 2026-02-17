import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get Date from Query Param (or default to server time)
        const { searchParams } = new URL(request.url)
        const queryDate = searchParams.get('date')
        const queryTime = searchParams.get('time')

        const now = new Date()
        const today = queryDate || now.toISOString().split('T')[0]

        // Use client's local time if provided, fallback to server's local time
        const currentTime = queryTime || now.toTimeString().split(' ')[0] // HH:mm:ss

        // 1. Get Teacher Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        console.log(`[WORKSPACE_API] USER_ID: ${user.id} | PROFILE_TENANT: ${profile?.tenant_id}`)



        // Derive day of week from 'today' to be timezone-aligned with client
        // Important: Use T00:00:00 to avoid timezone shifts during parsing
        const dateObj = queryDate ? new Date(queryDate + 'T00:00:00') : now
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const currentDay = days[dateObj.getDay()]

        console.log(`[WORKSPACE_API] User: ${user.id} | Today: ${today} | Time: ${currentTime} | Day: ${currentDay}`)

        // 1.5 Get Active Academic Session
        console.log(`[WORKSPACE_API] Querying Academic Session for Tenant: ${profile?.tenant_id}`)
        const { data: activeAcademicSession, error: sessionError } = await supabase
            .from('academic_sessions')
            .select('*')
            .eq('tenant_id', profile?.tenant_id)
            .eq('is_active', true)
            .maybeSingle()

        if (sessionError) console.error(`[WORKSPACE_API] Session Error:`, sessionError)
        console.log(`[WORKSPACE_API] Active Session Found:`, activeAcademicSession?.name)

        // 2. Resolve Active Session from Timetable
        const { data: activeSession, error: tError } = await supabase
            .from('timetables')
            .select(`
                *,
                classes (id, name, grade_level),
                subjects (id, name)
            `)
            .eq('teacher_id', user.id)
            .ilike('day_of_week', currentDay)
            .lte('start_time', currentTime)
            .gte('end_time', currentTime)
            .maybeSingle()

        if (tError) console.error(`[WORKSPACE_API] Timetable Error:`, tError)
        console.log(`[WORKSPACE_API] Active Session:`, activeSession ? activeSession.classes?.name : 'NONE')

        // 3. Get Assigned Classes (Backup/Context)
        // Hierarchy: Form Class > Subject Class > Any Class (Fallbacks)

        // A. Check Form Teacher (Direct Class Ownership)
        // We use maybeSingle() because a teacher usually has only one form class
        const { data: formClass } = await supabase
            .from('classes')
            .select('id, name, grade_level')
            .eq('form_teacher_id', user.id)
            .maybeSingle()

        let assignedClass = null

        if (formClass) {
            assignedClass = { ...formClass, subject: 'Form Class' }
        } else {
            // B. Check Subject Assignments if not a form teacher
            const { data: subjectAssigns } = await supabase
                .from('subject_assignments')
                .select('class_id, classes!inner(id, name, grade_level), subject')
                .eq('teacher_id', user.id)
                .limit(1)

            if (subjectAssigns && subjectAssigns.length > 0) {
                // @ts-ignore
                const cls = subjectAssigns[0].classes
                if (cls) {
                    assignedClass = { ...cls, subject: subjectAssigns[0].subject }
                }
            }
        }

        // 4. Resolve Active Class with Intelligent Prioritization
        // Priority: 1. Current Timetable Session | 2. Recently Modified Register (Today) | 3. Form Class | 4. First Assigned Subject

        let resolvedActiveClass: any = activeSession?.classes

        if (!resolvedActiveClass) {
            console.log(`[WORKSPACE_API] No timetable session. Checking for most recently marked register with records...`)

            // Look for registers today that have at least one attendance record
            const { data: populatedRegisters } = await supabase
                .from('attendance_registers')
                .select('id, class_id, classes(id, name, grade_level), student_attendance!inner(id)')
                .eq('marked_by', user.id)
                .eq('date', today)
                .order('created_at', { ascending: false })
                .limit(1)

            if (populatedRegisters && populatedRegisters.length > 0) {
                const recentPopulated = populatedRegisters[0]
                console.log(`[WORKSPACE_API] Prioritizing populated register: ${(recentPopulated.classes as any).name}`)
                // @ts-ignore
                resolvedActiveClass = recentPopulated.classes
                assignedClass = { ...resolvedActiveClass, subject: 'Active Register' }
            } else {
                // Fallback to absolute most recent even if empty
                const { data: recentEmpty } = await supabase
                    .from('attendance_registers')
                    .select('class_id, classes(id, name, grade_level)')
                    .eq('marked_by', user.id)
                    .eq('date', today)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                if (recentEmpty && recentEmpty.classes) {
                    // @ts-ignore
                    resolvedActiveClass = recentEmpty.classes
                    assignedClass = { ...resolvedActiveClass, subject: 'Empty Register' }
                }
            }
        }

        if (!resolvedActiveClass) {
            console.log(`[WORKSPACE_API] No active register. Falling back to assigned classes (Form or Subject)...`)
            resolvedActiveClass = assignedClass
        }

        if (resolvedActiveClass) {
            console.log(`[WORKSPACE_API] Final Resolved Active Class:`, resolvedActiveClass.name)
        } else {
            console.log(`[WORKSPACE_API] No active or assigned class found.`)
        }

        let presentCount = 0
        let absentCount = 0
        let lateCount = 0
        let calculatedAvg = 0

        if (resolvedActiveClass?.id) {
            // 1. Today's Vitals - Get Register ID first
            const { data: register } = await supabase
                .from('attendance_registers')
                .select('id')
                .eq('class_id', resolvedActiveClass.id)
                .eq('date', today)
                .maybeSingle()

            if (register) {
                console.log(`[WORKSPACE_API] Found Register ID: ${register.id} for Class: ${resolvedActiveClass.id}`)

                const { data: attendanceData, error: attError } = await supabase
                    .from('student_attendance')
                    .select('status')
                    .eq('register_id', register.id)

                if (attError) console.error(`[WORKSPACE_API] Attendance Fetch Error:`, attError)

                presentCount = attendanceData?.filter(a => a.status === 'present').length || 0
                absentCount = attendanceData?.filter(a => a.status === 'absent').length || 0
                lateCount = attendanceData?.filter(a => a.status === 'late').length || 0
                console.log(`[WORKSPACE_API] Counts -> Present: ${presentCount}, Absent: ${absentCount}`)
            } else {
                console.log(`[WORKSPACE_API] No Register found for today's stats query.`)
            }

            // 2. Dynamic Avg Attendance (Simple Class Average for last 7 days)
            const lastWeek = new Date()
            lastWeek.setDate(lastWeek.getDate() - 7)
            const lastWeekStr = lastWeek.toISOString().split('T')[0]

            const { data: registers } = await supabase
                .from('attendance_registers')
                .select('id')
                .eq('class_id', resolvedActiveClass.id)
                .gte('date', lastWeekStr)

            if (registers && registers.length > 0) {
                const registerIds = registers.map(r => r.id)
                const { data: classAttendanceVitals } = await supabase
                    .from('student_attendance')
                    .select('status')
                    .in('register_id', registerIds)

                const totalRecords = classAttendanceVitals?.length || 0
                const presentRecords = classAttendanceVitals?.filter(a => a.status === 'present').length || 0
                calculatedAvg = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0
            }
        }

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
        console.log(`[WORKSPACE_API] Querying Metrics for Teacher: ${user.id}`)
        // Pending Assignments: Count where grade is null AND teacher owns the assignment
        const { count: pendingAssignments, error: pError } = await supabase
            .from('assignment_submissions')
            .select('id, assignments!inner(teacher_id)', { count: 'exact', head: true })
            .eq('assignments.teacher_id', user.id)
            .is('grade', null)

        if (pError) console.error(`[WORKSPACE_API] Assignments Metric Error:`, pError)

        // Upcoming Exams: Count from cbt_quizzes
        const { count: upcomingExams, error: eError } = await supabase
            .from('cbt_quizzes')
            .select('id', { count: 'exact', head: true })
            .eq('teacher_id', user.id)
            .eq('is_active', true)

        if (eError) console.error(`[WORKSPACE_API] Exams Metric Error:`, eError)

        console.log(`[WORKSPACE_API] Metrics -> Pending: ${pendingAssignments || 0}, Exams: ${upcomingExams || 0}`)

        // Final Data Construction
        const activeClass = activeSession?.classes || assignedClass || { name: 'No Active Class', grade_level: 'Free Period' }
        const activeSubject = activeSession?.subjects?.name || (assignedClass ? assignedClass.subject : "No Active Session")

        return NextResponse.json({
            profile,
            activeSession: activeAcademicSession,
            activeClass: {
                ...activeClass,
                subject: activeSubject,
                // @ts-ignore
                start_time: activeSession?.start_time,
                // @ts-ignore
                end_time: activeSession?.end_time,
                academic_session: activeAcademicSession?.session,
                term: activeAcademicSession?.term?.toLowerCase().includes('term')
                    ? activeAcademicSession.term
                    : `${activeAcademicSession?.term} Term`
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
