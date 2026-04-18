'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAdminStats() {
    const supabase = createClient()

    try {
        // 1. Get current tenant
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // Fetch tenant ID for application-level isolation (Defense in Depth)
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        const tenantId = profile?.tenant_id

        if (!tenantId) return null

        const [studentsResult, teachersResult, classesResult, transactionsResult] = await Promise.all([
            supabase.from('students').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher').eq('tenant_id', tenantId),
            supabase.from('classes').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
            supabase.from('transactions').select('amount').eq('status', 'success').eq('tenant_id', tenantId)
        ])

        const totalRevenue = (transactionsResult.data || []).reduce((sum, trx) => sum + (Number(trx.amount) || 0), 0)

        // Finance Leakage Stats (Unpaid past due fees)
        const todayStr = new Date().toISOString().split('T')[0]
        const { data: unpaidFees } = await supabase
            .from('fees')
            .select('amount')
            .eq('status', 'unpaid')
            .lt('due_date', todayStr)
            .eq('tenant_id', tenantId)

        const revenueLeakage = (unpaidFees || []).reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0)
        const orphanedFeesCount = unpaidFees?.length || 0
        const totalPotentialRevenue = totalRevenue + revenueLeakage
        const recoveryRate = totalPotentialRevenue > 0 ? Math.round((totalRevenue / totalPotentialRevenue) * 100) : 0

        // Hostel Stats (Requires join if filtering manually, but RLS handles it now OR we join explicitly)
        const { data: rooms } = await supabase.from('hostel_rooms').select('capacity, occupancy, maintenance_status, hostels!inner(tenant_id)').eq('hostels.tenant_id', tenantId)
        const totalCapacity = (rooms || []).reduce((sum, r) => sum + (r.capacity || 0), 0)
        const totalOccupancy = (rooms || []).reduce((sum, r) => sum + (r.occupancy || 0), 0)
        const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0
        const maintenanceAlerts = (rooms || []).filter(r => r.maintenance_status !== 'clean').length

        // 5. Chart Data: Revenue Overview (Last 12 Months)
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11)
        twelveMonthsAgo.setDate(1)

        const { data: monthlyTransactions } = await supabase
            .from('transactions')
            .select('amount, date')
            .eq('status', 'success')
            .gte('date', twelveMonthsAgo.toISOString())
            .eq('tenant_id', tenantId)

        const revenueChartData = Array.from({ length: 12 }, (_, i) => {
            const d = new Date()
            d.setMonth(d.getMonth() - (11 - i))
            const monthName = months[d.getMonth()]
            const year = d.getFullYear()

            const total = (monthlyTransactions || [])
                .filter(t => {
                    const tDate = new Date(t.date)
                    return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear()
                })
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

            return { name: monthName, total }
        })

        // 6. Chart Data: Student Demographics
        const { data: genderData } = await supabase
            .from('students')
            .select('gender')
            .eq('tenant_id', tenantId)

        const demographicsData = [
            { name: "Male", value: (genderData || []).filter(s => s.gender?.toLowerCase() === 'male').length },
            { name: "Female", value: (genderData || []).filter(s => s.gender?.toLowerCase() === 'female').length },
            { name: "Others", value: (genderData || []).filter(s => !['male', 'female'].includes(s.gender?.toLowerCase() || '')).length },
        ].filter(d => d.value > 0)

        // If no data, provide a fallback so chart doesn't look empty for first-time users
        const finalDemographics = demographicsData.length > 0 ? demographicsData : [
            { name: "Male", value: 0 },
            { name: "Female", value: 0 },
            { name: "Others", value: 0 },
        ]

        // 7. Recent Activity
        const { data: recentStudents } = await supabase
            .from('students')
            .select('full_name, created_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(10)

        const { data: recentClasses } = await supabase
            .from('classes')
            .select('name, created_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(10)

        const { data: recentAchievements } = await supabase
            .from('achievements')
            .select('title, created_at, student:students(full_name)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(10)

        const activities = [
            ...(recentStudents || []).map(s => ({
                type: 'New Student',
                message: `${s.full_name} joined the school`,
                time: s.created_at
            })),
            ...(recentClasses || []).map(c => ({
                type: 'New Class',
                message: `Class "${c.name}" was created`,
                time: c.created_at
            })),
            ...(recentAchievements || []).map((a: any) => ({
                type: 'Achievement',
                message: `${a.student?.full_name} awarded "${a.title}"`,
                time: a.created_at
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20)

        // 8. Trend Calculations
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

        const thisMonthRevenue = revenueChartData[11]?.total || 0
        const lastMonthRevenue = revenueChartData[10]?.total || 0
        const revenueTrendValue = lastMonthRevenue > 0
            ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : (thisMonthRevenue > 0 ? 100 : 0)

        // Student Trend (New this month vs Total)
        const thisMonthStudents = (recentStudents || []).filter(s => {
            const d = new Date(s.created_at)
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear
        }).length
        const studentTrendValue = studentsResult.count && studentsResult.count > thisMonthStudents
            ? Math.round((thisMonthStudents / (studentsResult.count - thisMonthStudents)) * 100)
            : (thisMonthStudents > 0 ? 100 : 0)

        return {
            totalStudents: studentsResult.count || 0,
            totalTeachers: teachersResult.count || 0,
            totalClasses: classesResult.count || 0,
            totalRevenue,
            recentActivity: activities,
            finance: {
                revenueLeakage,
                orphanedFeesCount,
                recoveryRate,
                revenueTrend: `${revenueTrendValue >= 0 ? '+' : ''}${revenueTrendValue}%`
            },
            hostel: {
                occupancyRate,
                maintenanceAlerts
            },
            charts: {
                revenue: revenueChartData,
                demographics: finalDemographics
            },
            studentTrend: `${studentTrendValue >= 0 ? '+' : ''}${studentTrendValue}%`
        }

    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return {
            totalStudents: 0,
            totalTeachers: 0,
            totalClasses: 0,
            totalRevenue: 0,
            finance: { revenueLeakage: 0, orphanedFeesCount: 0, recoveryRate: 0 },
            hostel: { occupancyRate: 0, maintenanceAlerts: 0 }
        }
    }
}

export async function getParentStats(studentId?: string) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()

        let student = null

        if (user) {
            // If user is authenticated, find their linked student
            let query = supabase
                .from('students')
                .select('id, full_name, class_id, classes!inner(name)')
                .eq('parent_id', user.id)

            if (studentId) {
                query = query.eq('id', studentId)
            }

            const { data: students } = await query.limit(1)

            student = students?.[0] || null
        }

        // DEMO/TESTING: If no authenticated user or no linked student, fetch any student
        if (!student) {
            const { data: students } = await supabase
                .from('students')
                .select('id, full_name, class_id, classes!inner(name)')
                .limit(1)

            student = students?.[0] || null
        }

        if (!student) {
            return {
                studentName: 'Student',
                className: 'Not Enrolled',
                overallProgress: 0,
                overallActivity: 0,
                totalTimeMinutes: 0,
                subjects: [],
                todaysActivities: []
            }
        }


        // Fetch student progress for all subjects
        const { data: progressData } = await supabase
            .from('student_progress')
            .select('*')
            .eq('student_id', student.id)
            .order('subject')

        // Fetch today's activities
        const today = new Date().toISOString().split('T')[0]
        const { data: activitiesData } = await supabase
            .from('student_activities')
            .select('*')
            .eq('student_id', student.id)
            .gte('created_at', today)
            .order('created_at', { ascending: true })

        // Calculate total time from today's activities
        const totalTimeMinutes = activitiesData?.reduce((sum, activity) =>
            sum + (activity.duration_minutes || 0), 0) || 0

        // Calculate overall progress (average across all subjects)
        const overallProgress = progressData && progressData.length > 0
            ? Math.round(progressData.reduce((sum, p) => sum + p.progress_percentage, 0) / progressData.length)
            : 0

        // Calculate overall activity (percentage of today's activities completed)
        const completedActivities = activitiesData?.filter(a => a.status === 'completed').length || 0
        const totalActivities = activitiesData?.length || 0
        const overallActivity = totalActivities > 0
            ? Math.round((completedActivities / totalActivities) * 100)
            : 0

        // Format subject data
        const subjects = progressData?.map(progress => ({
            subject: progress.subject,
            gradeLevel: progress.grade_level,
            completedLessons: progress.completed_lessons,
            totalLessons: progress.total_lessons,
            progressPercentage: progress.progress_percentage,
            nextLessonTitle: progress.next_lesson_title,
            topics: getSubjectTopics(progress.subject) // Helper function for topics
        })) || []

        // Format today's activities
        const todaysActivities = activitiesData?.map(activity => ({
            id: activity.id,
            subject: activity.subject,
            lessonNumber: activity.lesson_number,
            title: activity.title,
            status: activity.status,
            durationMinutes: activity.duration_minutes
        })) || []

        return {
            studentName: student.full_name,
            className: (student.classes && Array.isArray(student.classes) && student.classes.length > 0)
                ? student.classes[0].name
                : 'Not Assigned',
            overallProgress,
            overallActivity,
            totalTimeMinutes,
            subjects,
            todaysActivities
        }
    } catch (error) {
        console.error('Error fetching parent stats:', error)
        return null
    }
}

// Helper function to get subject-specific topics
function getSubjectTopics(subject: string): string[] {
    const topicMap: Record<string, string[]> = {
        'Math': ['Addition & Subtraction', 'Place Value Understanding', 'Word Problem Solving'],
        'Reading': ['Vocabulary Building', 'Reading Comprehension', 'Story Retelling'],
        'Science': ['Life Science', 'Physical Science', 'Earth Science'],
        'Writing': ['Sentence Structure', 'Paragraph Writing', 'Creative Writing'],
        'Social Studies': ['Community', 'Geography', 'History']
    }
    return topicMap[subject] || []
}

export async function getTeacherStats() {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // In a real app we would filter by the specific teacher's ID
        // For now, since RLS might rely on just being in the tenant, 
        // we might fetch all classes in tenant or specific to user if RLS is strict.
        // Let's assume valid RLS layout:

        const today = new Date().toISOString().split('T')[0]

        const [classesResult, lessonsResult] = await Promise.all([
            supabase.from('classes').select('*'),
            supabase.from('lesson_plans').select('*').gte('date', today).order('date', { ascending: true }).limit(5)
        ])

        // Mock assignments count for now
        return {
            classes: classesResult.data || [],
            upcomingLessons: lessonsResult.data || [],
            assignmentsToGrade: 12,
            upcomingExams: 2,
            averageAttendance: 95
        }

    } catch (error) {
        console.error('Error fetching teacher stats:', error)
        return null
    }
}
