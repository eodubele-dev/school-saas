'use server'

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export async function getStudentResultPortalData(studentId: string, term: string, session: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Get User Profile for Tenant Context
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile) {
        return { success: false, error: 'User profile not found' }
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);

    let query = supabase.from('students')
        .select('*, class:classes(name)')
        .eq('tenant_id', profile.tenant_id) // STRICT TENANT ISOLATION

    if (isUUID) {
        query = query.eq('id', studentId)
    } else {
        const potentialAdmNo = studentId.replace(/-/g, '/')
        query = query.or(`admission_number.eq.${studentId},admission_number.eq.${potentialAdmNo}`)
    }

    const { data: students, error: studentError } = await query

    if (studentError || !students || students.length === 0) {
        console.log("Student lookup failed:", studentId, studentError)
        return { success: false, error: 'Student not found in your school' }
    }

    const student = students[0]
    const verifiedStudentId = student.id; // Use the actual UUID for subsequent queries

    // 2. Report Card & Lock Status
    const { data: reportCard } = await supabase
        .from('student_report_cards')
        .select('*')
        .eq('student_id', verifiedStudentId)
        .eq('term', term)
        .eq('session', session)
        .single()

    // 3. Billing Status (Fallback for Lock)
    const { data: billing } = await supabase
        .from('invoices')
        .select('status, amount, amount_paid')
        .eq('student_id', verifiedStudentId)
        .eq('term', `${session} ${term}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // Logic: Locked if reportCard.is_locked is true.
    const isLocked = reportCard?.is_locked ?? true
    const balance = billing ? (Number(billing.amount) - (Number(billing.amount_paid) || 0)) : 0

    // 4. Grades
    const { data: grades } = await supabase
        .from('student_grades')
        .select('*, subject:subjects(name)')
        .eq('student_id', verifiedStudentId)
        .eq('term', term)
        .eq('session', session)
        .order('created_at', { ascending: true })

    // 5. Attendance
    const { data: attendance } = await supabase
        .from('student_attendance')
        .select('status')
        .eq('student_id', verifiedStudentId)

    // Calculate Tally
    const totalDays = attendance?.length || 0
    const presentDays = attendance?.filter(a => a.status === 'present').length || 0

    // 6. Tenant (School) Info for Branding
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', student.tenant_id)
        .single()

    return {
        success: true,
        data: {
            student,
            reportCard,
            grades: grades || [],
            billing: {
                isPaid: !isLocked, // If unlocked, we treat as "paid" for access purposes
                balance
            },
            attendance: {
                total: totalDays,
                present: presentDays,
                percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
            },
            tenant
        }
    }
}

export async function getParentChildren() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch students linked to this parent with their classes
    const { data: students, error } = await supabase
        .from('students')
        .select('id, full_name, parent_id, passport_url, classes(name)')
        .eq('parent_id', user.id)

    if (error) {
        console.error('[ParentPortal] Error fetching students:', error)
        return []
    }

    // Enhance students with billing data
    const studentsWithFinance = await Promise.all(students.map(async (student) => {
        const { data: invoices } = await supabase
            .from('invoices')
            .select('amount, amount_paid')
            .eq('student_id', student.id)
            .neq('status', 'paid')

        const balance = invoices ? invoices.reduce((sum, inv) => sum + (Number(inv.amount) - (Number(inv.amount_paid) || 0)), 0) : 0

        return {
            ...student,
            school_fees_debt: balance
        }
    }))

    return studentsWithFinance
}

export async function getStudentAttendanceAudit(studentId: string, page = 1, pageSize = 20) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // 1. Calculate range
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    // 2. Fetch Attendance Logs with count
    const { data: logs, error, count } = await supabase
        .from('student_attendance')
        .select(`
            *,
            register:attendance_registers(date),
            clock_in_time,
            clock_out_time
        `, { count: 'exact' })
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) {
        console.error('[ParentPortal] Attendance Audit Error:', error)
        return { success: false, error: 'Failed to fetch logs' }
    }

    // 2.5 Fetch clocked_out_by profiles manually to avoid schema cache issues with missing foreign keys
    const profileIds = Array.from(new Set((logs || []).map(l => l.clocked_out_by).filter(Boolean))) as string[];
    let profileMap: Record<string, string> = {};
    if (profileIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', profileIds);
        if (profiles) {
            profileMap = profiles.reduce((acc: any, p: any) => {
                acc[p.id] = p.full_name;
                return acc;
            }, {});
        }
    }

    const enhancedLogs = (logs || []).map((log: any) => ({
        ...log,
        clocked_out: log.clocked_out_by && profileMap[log.clocked_out_by] ? { full_name: profileMap[log.clocked_out_by] } : null
    }));

    // Sort by date (descending) since we couldn't order by joined column easily
    // Though range might already be somewhat ordered by created_at which is close to date
    const sortedLogs = enhancedLogs.sort((a: any, b: any) => {
        const dateA = new Date(a.register?.date || 0).getTime()
        const dateB = new Date(b.register?.date || 0).getTime()
        return dateB - dateA
    })

    return { 
        success: true, 
        data: sortedLogs,
        pagination: {
            page,
            pageSize,
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / pageSize)
        }
    }
}

export async function logInvoiceView(studentId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // For Platinum Demo: functionality is "simulated" via console if table missing
    // or we can try to insert into a generic 'activity_logs' if it existed.
    // We'll just log to console for now to avoid schema blocking.
    console.log(`[AUDIT] Invoice Viewed for Student ${studentId} by Parent ${user?.id} at ${new Date().toISOString()}`)

    return { success: true }
}

export async function getFamilyBillingLedger() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // 1. Get All Students
    const { data: students, error } = await supabase
        .from('students')
        .select('*, class:classes(name)')
        .eq('parent_id', user.id)

    if (error || !students || students.length === 0) {
        return { success: false, error: 'Failed to fetch students', debug: error }
    }

    const tenantId = students[0].tenant_id

    // Get Active Session
    const { data: session } = await supabase
        .from('academic_sessions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single()

    const currentTermString = session ? `${session.session} ${session.term}` : null
    const sessionName = session ? `${session.session} Academic Year` : 'Academic Year'

    // 2. Fetch and Aggregate Billing & Transactions
    let totalFamilyBalance = 0;
    let totalExpectedAmount = 0;
    let totalPaidAmount = 0;
    const allChildIds = students.map(s => s.id);

    // Fetch all invoices for this term for all children
    const { data: allInvoices } = currentTermString ? await supabase
        .from('invoices')
        .select('*')
        .in('student_id', allChildIds)
        .eq('term', currentTermString) : { data: [] };

    const invoiceMap = new Map(allInvoices?.map(inv => [inv.student_id, inv]));

    // Fetch all transactions for these children
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .in('student_id', allChildIds)
        .order('date', { ascending: false })
        .limit(20)

    const childrenLedger = await Promise.all(students.map(async (student) => {
        let balance = 0;
        let fees: any[] = [];
        let status = 'paid';
        let attendancePercentage = 0;
        const invoice = invoiceMap.get(student.id);

        if (invoice) {
            balance = Number(invoice.amount) - (Number(invoice.amount_paid) || 0)
            status = invoice.status
            totalExpectedAmount += Number(invoice.amount)
            totalPaidAmount += Number(invoice.amount_paid)

            const itemsArr = invoice.items as any[] || []
            itemsArr.forEach(item => {
                const desc = item.description?.toLowerCase() || ""
                let icon = 'GraduationCap'
                if (desc.includes('bus') || desc.includes('transport')) icon = 'Bus'
                else if (desc.includes('dev') || desc.includes('levy') || desc.includes('tech')) icon = 'Cpu'

                fees.push({
                    label: item.description || 'Fee',
                    amount: item.amount,
                    icon
                })
            })
        }

        // 3. Fetch Attendance Stats
        const { data: attendance } = await supabase
            .from('student_attendance')
            .select('status')
            .eq('student_id', student.id)

        const totalDays = attendance?.length || 0
        const presentDays = attendance?.filter(a => a.status === 'present').length || 0
        attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

        totalFamilyBalance += balance;

        return {
            id: student.id,
            name: student.full_name,
            grade: student.class?.name || 'Unassigned',
            avatar: student.passport_url,
            attendancePercentage,
            balance,
            fees,
            status,
            invoiceId: invoice?.id || null
        }
    }))

    // Calculate Payment Health (Percentage of total expected amount that is paid)
    const paymentHealth = totalExpectedAmount > 0 
        ? Math.round((totalPaidAmount / totalExpectedAmount) * 100) 
        : 100;

    return {
        success: true,
        data: {
            totalBalance: totalFamilyBalance,
            sessionName,
            paymentHealth,
            recentTransactions: transactions || [],
            children: childrenLedger,
            parentEmail: user.email
        }
    }
}
