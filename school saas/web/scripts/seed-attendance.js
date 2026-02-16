
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY not found. RLS policies may block seeding.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedAttendance() {
    console.log('--- FINDING ACTIVE CLASSES ---')
    // 1. Get Classes with students
    const { data: classes, error: classError } = await supabase
        .from('classes')
        .select('id, name, form_teacher_id, students(id, full_name)')
        .limit(20)

    if (classError) {
        console.error('Error fetching classes:', classError)
        return
    }

    const validClasses = classes.filter(c => c.students && c.students.length > 0 && c.form_teacher_id)
    console.log(`Found ${validClasses.length} valid classes (with students and teacher)`)

    if (validClasses.length === 0) {
        console.log('No valid classes found to seed.')
        return
    }

    const today = new Date().toISOString().split('T')[0]
    console.log(`Seeding attendance for date: ${today}`)

    // Get a valid fallback tenant ID
    const { data: tenants } = await supabase.from('tenants').select('id').limit(1)
    const defaultTenantId = tenants && tenants.length > 0 ? tenants[0].id : null

    if (!defaultTenantId) {
        console.error('CRITICAL: No tenants found in database. Cannot seed.')
        // Fallback to a hardcoded UUID if needed, but risky.
        // Assuming there must be at least one tenant.
        return
    }

    for (const targetClass of validClasses) {
        console.log(`Processing Class: ${targetClass.name}`)

        // Try to fetch tenant_id
        let tenantId = defaultTenantId
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', targetClass.form_teacher_id).single()
        if (profile) {
            tenantId = profile.tenant_id
        } else {
            console.log(`-- Warning: No profile found for teacher ${targetClass.form_teacher_id}, using default tenant '${tenantId}'`)
        }

        const { data: register, error: regError } = await supabase
            .from('attendance_registers')
            .upsert({
                class_id: targetClass.id,
                date: today,
                marked_by: targetClass.form_teacher_id,
                tenant_id: tenantId
            }, { onConflict: 'class_id,date' })
            .select()
            .single()

        if (regError) {
            console.error(`-- Error creating register for ${targetClass.name}:`, regError.message)
            continue
        }

        await seedStudents(register.id, targetClass.students, supabase, tenantId)
    }
}

async function seedStudents(registerId, students, supabase, tenantId) {
    const records = students.map((s, index) => ({
        register_id: registerId,
        student_id: s.id,
        status: index % 5 === 0 ? 'absent' : 'present', // 1 in 5 absent
        remarks: index % 5 === 0 ? 'Sick' : null,
        clock_in_time: index % 5 !== 0 ? new Date().toISOString() : null,
        tenant_id: tenantId
    }))

    const { error: seedError } = await supabase
        .from('student_attendance')
        .upsert(records, { onConflict: 'register_id,student_id' })

    if (seedError) {
        console.error('-- Error seeding students:', seedError.message)
    } else {
        console.log(`-- Successfully seeded ${records.length} records.`)
    }
}

seedAttendance()
