'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAdminStats() {
    const supabase = createClient()

    try {
        // 1. Get current tenant
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // We need the tenant_id. Using get_auth_tenant_id function or fetching profile.
        // Since RLS is on, simple queries to 'students' etc should automatically filter by tenant
        // IF the user has a profile with the correct tenant_id.

        // Let's rely on RLS. If RLS is working, 'select count' on students 
        // will only return students for this tenant.

        const [studentsResult, teachersResult, classesResult] = await Promise.all([
            supabase.from('students').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
            supabase.from('classes').select('*', { count: 'exact', head: true })
        ])

        // Fetch recent 5 items across tables to simulate "Activity"
        // In a real dedicated system we'd have an 'events' table.
        // Here we just show "New Student Joined" etc based on created_at.
        const { data: recentStudents } = await supabase
            .from('students')
            .select('full_name, created_at')
            .order('created_at', { ascending: false })
            .limit(10)

        const { data: recentClasses } = await supabase
            .from('classes')
            .select('name, created_at')
            .order('created_at', { ascending: false })
            .limit(10)

        const { data: recentAchievements } = await supabase
            .from('achievements')
            .select('title, created_at, student:students(full_name)')
            .order('created_at', { ascending: false })
            .limit(10)

        // standardized activity format
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

        return {
            totalStudents: studentsResult.count || 0,
            totalTeachers: teachersResult.count || 0,
            totalClasses: classesResult.count || 0,
            // Mock revenue for now as we don't have payments table
            totalRevenue: 45231.89,
            recentActivity: activities
        }

    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return {
            totalStudents: 0,
            totalTeachers: 0,
            totalClasses: 0,
            totalRevenue: 0
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
