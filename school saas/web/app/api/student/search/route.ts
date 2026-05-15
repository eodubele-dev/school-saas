import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
        return NextResponse.json({ results: [] })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get tenant ID from profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
    }

    const tenantId = profile.tenant_id

    // Search Assignments
    const { data: assignments } = await supabase
        .from('assignments')
        .select(`
            id,
            title,
            due_date,
            subjects (name)
        `)
        .eq('tenant_id', tenantId)
        .ilike('title', `%${query}%`)
        .limit(3)

    // Search Timetable Subjects
    const { data: timetables } = await supabase
        .from('timetables')
        .select(`
            id,
            day_of_week,
            start_time,
            subjects!inner(name)
        `)
        .eq('tenant_id', tenantId)
        .ilike('subjects.name', `%${query}%`)
        .limit(3)

    // Format results
    let results: any[] = []

    if (assignments && assignments.length > 0) {
        assignments.forEach(a => {
            const subjectName = Array.isArray(a.subjects) ? a.subjects[0]?.name : (a.subjects as any)?.name
            results.push({
                id: a.id,
                type: 'assignment',
                title: a.title,
                subtitle: `${subjectName || 'General'} - Due: ${a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}`,
                url: `/dashboard/student/assignments`
            })
        })
    }

    if (timetables && timetables.length > 0) {
        timetables.forEach(t => {
            const subjectName = Array.isArray(t.subjects) ? t.subjects[0]?.name : (t.subjects as any)?.name
            results.push({
                id: t.id,
                type: 'timetable',
                title: `${subjectName} Class`,
                subtitle: `${t.day_of_week} at ${t.start_time}`,
                url: `/dashboard/student/timetable`
            })
        })
    }

    // Sort or limit total
    return NextResponse.json({ results: results.slice(0, 5) })
}
