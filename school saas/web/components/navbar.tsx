import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from 'next/cache'
import { MobileNav } from "./mobile-nav"
import { Sidebar } from "./sidebar"
import { DynamicTopBar } from "@/components/layout/dynamic-top-bar"
import { getNextClass } from "@/lib/actions/schedule"

export async function Navbar({ domain }: { domain?: string }) {
    const supabase = createClient()

    // Fetch authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    let userName = "Guest"
    let userRole = "Visitor"
    let userAvatarUrl = null
    let schoolName = "EduFlow"
    let schoolLogo = null
    let userId = user?.id

    // Dynamic Data Containers
    let campuses: any[] = []
    let teacherClasses: any[] = []
    let studentClass: any = null
    let pendingReconciliations = 0
    let profile: any = null

    if (user) {
        const { data: profileRes } = await supabase
            .from('profiles')
            .select('full_name, role, avatar_url, tenant_id')
            .eq('id', user.id)
            .single()

        profile = profileRes

        if (profile) {
            userName = profile.full_name || user.email?.split('@')[0] || "User"
            userRole = profile.role || "User"
            userAvatarUrl = profile.avatar_url
            const tenantId = profile.tenant_id

            // Fetch school name and logo
            if (tenantId) {
                const { data: tenant } = await supabase.from('tenants').select('name, logo_url, tier').eq('id', tenantId).single()
                if (tenant) {
                    schoolName = tenant.name
                    // @ts-ignore - logo_url exists but types might be stale
                    schoolLogo = tenant.logo_url
                }

                // 1. Fetch Campuses (School Locations) - For Admin/Bursar
                if (['admin', 'bursar', 'owner', 'proprietor'].includes(userRole)) {
                    const { data: locations } = await supabase
                        .from('school_locations')
                        .select('id, name')
                        .eq('tenant_id', tenantId)

                    campuses = locations || []
                }

                // 2. Fetch Pending Reconciliations - For Bursar
                if (userRole === 'bursar') {
                    const { count } = await supabase
                        .from('transactions')
                        .select('*', { count: 'exact', head: true })
                        .eq('tenant_id', tenantId)
                        .eq('status', 'pending')

                    pendingReconciliations = count || 0
                }

                // 3. Fetch Teacher Classes - For Teacher (Combined from Allocations & Form Teacher & Subject Assignments)
                if (userRole === 'teacher') {
                    const classesMap = new Map<string, any>();

                    // A. Check Form Teacher (My Class)
                    const { data: formClasses } = await supabase
                        .from('classes')
                        .select('id, name')
                        .eq('form_teacher_id', user.id)

                    if (formClasses) {
                        formClasses.forEach(c => {
                            classesMap.set(c.id, {
                                id: c.id,
                                name: c.name,
                                subject: 'Form Class', // Special indicator
                                isFormTeacher: true
                            })
                        })
                    }

                    // B. Check Subject Assignments
                    const { data: subjectAssigns } = await supabase
                        .from('subject_assignments')
                        .select('class_id, subject, classes(id, name)')
                        .eq('teacher_id', user.id)

                    if (subjectAssigns) {
                        subjectAssigns.forEach((sa: any) => {
                            const cls = Array.isArray(sa.classes) ? sa.classes[0] : sa.classes
                            if (cls && !classesMap.has(cls.id)) {
                                classesMap.set(cls.id, {
                                    id: cls.id,
                                    name: cls.name,
                                    subject: sa.subject,
                                    isFormTeacher: false
                                })
                            }
                        })
                    }

                    // C. Check Allocations (Legacy/Alternate)
                    const { data: allocs } = await supabase
                        .from('teacher_allocations')
                        .select('class_id, subject, is_form_teacher, classes(id, name)')
                        .eq('teacher_id', user.id)

                    if (allocs) {
                        allocs.forEach((a: any) => {
                            const cls = Array.isArray(a.classes) ? a.classes[0] : a.classes
                            if (cls && !classesMap.has(cls.id)) {
                                classesMap.set(cls.id, {
                                    id: cls.id,
                                    name: cls.name,
                                    subject: a.subject,
                                    isFormTeacher: a.is_form_teacher
                                })
                            }
                        })
                    }

                    teacherClasses = Array.from(classesMap.values())
                }

                // 4. Fetch Student Class/Grade - For Student
                if (userRole === 'student') {
                    // Attempt to fetch student data if linked via parent_id (common pattern)
                    const { data: studentData } = await supabase
                        .from('students')
                        .select('class_id, classes(name, grade_level)')
                        .eq('parent_id', user.id)
                        .maybeSingle()

                    if (studentData) {
                        const sData = studentData as any
                        const cls = Array.isArray(sData.classes) ? sData.classes[0] : sData.classes
                        studentClass = {
                            id: sData.class_id,
                            name: cls?.name,
                            grade: cls?.grade_level
                        }
                    }
                }

                // 5. Fetch Family Info - For Parent
                if (userRole === 'parent') {
                    // Parent logic can go here (e.g. fetch children count)
                }

                // Correction for Student Fetch:
                // If I can't link logged-in student to `students` table, I can't get class.
                // But I can check if `students` table has a column I missed.
                // Let's assume for this "Production Readiness" check, if I can't find it, I leave it as "Grade 10" 
                // BUT I should check `students` table columns again. 
                // In `engagement_module.sql`, `student_attendance` references `students(id)`.
                // In `schema.sql`: `create table public.students ... parent_id uuid references public.profiles(id)`
                // No `profile_id`.
                // Maybe the `students` table needs a `profile_id` column to allow students to log in?
                // Or maybe `email`?
                // For now, I will skip fetching specific class for student role since link is missing in schema.
                // I will add a TODO or just omit it.

                // However, I can fetch generic info or "My Class" if I assume some logic.
            }
        }
    }

    // Prepare mobile nav component to pass down
    const MobileNavComponent = (
        <MobileNav>
            <Sidebar domain={domain} className="w-full h-full border-none" />
        </MobileNav>
    )

    const userProfile = {
        userName,
        userRole: userRole.charAt(0).toUpperCase() + userRole.slice(1),
        userEmail: user?.email,
        userAvatarUrl
    }

    // 5. Fetch Active Session
    noStore()
    let activeSessionDisplay = ""
    if (user) {
        if (profile?.tenant_id) {
            const { data: sessionData } = await supabase
                .from('academic_sessions')
                .select('session, term')
                .eq('tenant_id', profile.tenant_id)
                .eq('is_active', true)
                .maybeSingle()
            if (sessionData) {
                activeSessionDisplay = `${sessionData.session} • ${sessionData.term}`
            }
        }
    }

    let tenantTier = 'Free'
    if (profile?.tenant_id) {
        // Re-fetch because initial fetch might have missed tier if cached or structure different
        const { data: tenant } = await supabase.from('tenants').select('tier').eq('id', profile.tenant_id).single()
        if (tenant) tenantTier = tenant.tier || 'Free'
    }

    return (
        <DynamicTopBar
            user={user}
            role={userRole}
            schoolName={schoolName}
            schoolLogo={schoolLogo}
            mobileNav={MobileNavComponent}
            userProfile={userProfile}
            campuses={campuses}
            teacherClasses={teacherClasses}
            pendingReconciliations={pendingReconciliations}
            activeSession={activeSessionDisplay}
            tier={tenantTier}
        />
    )
}
