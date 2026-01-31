'use server'

import { createClient } from '@/lib/supabase/server'

export async function testDatabaseConnection() {
    const supabase = createClient()

    try {
        // Test 1: Can we connect to Supabase?
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        console.log('Auth test:', user ? 'User found' : 'No user', authError)

        // Test 2: Do tables exist and have data?
        const { data: tenants, error: tenantsError } = await supabase
            .from('tenants')
            .select('*')
            .limit(1)
        console.log('Tenants:', tenants, tenantsError)

        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .limit(1)
        console.log('Students:', students, studentsError)

        const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .limit(1)
        console.log('Lessons:', lessons, lessonsError)

        const { data: progress, error: progressError } = await supabase
            .from('student_progress')
            .select('*')
            .limit(1)
        console.log('Progress:', progress, progressError)

        const { data: activities, error: activitiesError } = await supabase
            .from('student_activities')
            .select('*')
            .limit(1)
        console.log('Activities:', activities, activitiesError)

        return {
            success: true,
            results: {
                tenants: { count: tenants?.length || 0, error: tenantsError?.message },
                students: { count: students?.length || 0, error: studentsError?.message },
                lessons: { count: lessons?.length || 0, error: lessonsError?.message },
                progress: { count: progress?.length || 0, error: progressError?.message },
                activities: { count: activities?.length || 0, error: activitiesError?.message }
            }
        }
    } catch (error) {
        console.error('Database test error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}
