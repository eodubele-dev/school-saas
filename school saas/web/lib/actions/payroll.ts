'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface GeneratePayrollParams {
    month: string
    year: number
    daysInMonth: number // Working days expected
    dailyRateDivisor: number // Usually 22 or 30 days to calculate daily rate
}

/**
 * Generate (or Regenerate) a Payroll Run
 */
export async function generatePayrollRun({ month, year, daysInMonth, dailyRateDivisor }: GeneratePayrollParams) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Unauthorized" }

        // 1. Create or Get Payroll Run
        const { data: run, error: runError } = await supabase
            .from('payroll_runs')
            .upsert({
                tenant_id: profile.tenant_id,
                month,
                year,
                generated_by: user.id,
                status: 'draft' // Reset to draft if regenerating
            }, { onConflict: 'tenant_id, month, year' })
            .select()
            .single()

        if (runError) throw runError

        // 2. Fetch Active Staff with Salary Structures
        const { data: staffList, error: staffError } = await supabase
            .from('profiles')
            .select(`
                id, 
                salary_struct:salary_structures(*)
            `)
            .eq('tenant_id', profile.tenant_id)
            .eq('status', 'active')
            .in('role', ['teacher', 'admin', 'principal', 'bursar']) // Applicable roles

        if (staffError) throw staffError

        // 3. Clear existing items for this run (to support regeneration)
        await supabase.from('payroll_items').delete().eq('payroll_run_id', run.id)

        // 4. Calculate Pay for each Staff
        const payrollItems = []
        let totalPayout = 0

        // Parse date for attendance query
        // E.g. "September 2023" -> start_date and end_date
        // Simplified: We assume consumer passes correct context, but let's derive timestamps if needed
        // For attendance query, we need YYYY-MM prefix.
        const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1
        const monthStr = monthIndex.toString().padStart(2, '0')
        const startDate = `${year}-${monthStr}-01`
        const endDate = `${year}-${monthStr}-31` // Loose match is fine for text query if needed

        const { data: attendanceData } = await supabase
            .from('staff_attendance')
            .select('staff_id, status, check_in_time')
            .eq('tenant_id', profile.tenant_id)
            .gte('date', startDate)
            .lte('date', endDate)

        for (const staff of staffList) {
            // Stats
            const rawStruct = staff.salary_struct
            const struct = (Array.isArray(rawStruct) ? rawStruct[0] : rawStruct) || {
                base_salary: 0,
                housing_allowance: 0,
                transport_allowance: 0,
                tax_deduction: 0,
                pension_deduction: 0
            }

            const staffAttendance = attendanceData?.filter((r: any) => r.staff_id === staff.id) || []
            const daysPresent = staffAttendance.filter((r: any) => r.status === 'present').length
            const lateCount = staffAttendance.filter((r: any) => {
                if (!r.check_in_time) return false
                const [h, m] = r.check_in_time.split(':').map(Number)
                return h > 8 || (h === 8 && m > 5)
            }).length

            // Calculations
            // Gross = Base + Allowances
            const gross = (struct.base_salary || 0) + (struct.housing_allowance || 0) + (struct.transport_allowance || 0)

            // Daily Rate for Deductions
            const dailyRate = gross / dailyRateDivisor

            // Unexcused Absence Deduction
            const daysAbsent = Math.max(0, daysInMonth - daysPresent)
            let attendanceDeduction = daysAbsent * dailyRate

            // Late Fine: Flattened, e.g., 500 per lateness
            const lateFine = 500 * lateCount
            attendanceDeduction += lateFine

            // Cap deduction
            attendanceDeduction = Math.min(attendanceDeduction, gross)

            const totalDeductions = (struct.tax_deduction || 0) + (struct.pension_deduction || 0) + attendanceDeduction
            const netPay = gross - totalDeductions

            totalPayout += netPay

            payrollItems.push({
                tenant_id: profile.tenant_id,
                payroll_run_id: run.id,
                staff_id: staff.id,
                base_salary: struct.base_salary || 0,
                total_allowances: (struct.housing_allowance || 0) + (struct.transport_allowance || 0),
                days_present: daysPresent,
                days_absent: daysAbsent,
                lateness_count: lateCount,
                attendance_deductions: attendanceDeduction,
                tax_deduction: struct.tax_deduction || 0,
                pension_deduction: struct.pension_deduction || 0,
                net_pay: netPay
            })
        }

        // 5. Bulk Insert Items
        if (payrollItems.length > 0) {
            const { error: insertError } = await supabase.from('payroll_items').insert(payrollItems)
            if (insertError) throw insertError
        }

        // 6. Update Run Totals
        await supabase.from('payroll_runs').update({ total_payout: totalPayout }).eq('id', run.id)

        revalidatePath('/dashboard/bursar/finance/payroll')
        return { success: true, data: run }

    } catch (error) {
        console.error("Payroll generation error:", error)
        return { success: false, error: "Failed to generate payroll" }
    }
}

/**
 * Get Payroll History/Runs
 */
export async function getPayrollRuns() {
    const supabase = createClient()
    const { data } = await supabase.from('payroll_runs').select('*').order('created_at', { ascending: false })
    return { success: true, data }
}

/**
 * Get Specific Payroll Run Details
 */
export async function getPayrollRunDetails(runId: string) {
    const supabase = createClient()
    const { data: run } = await supabase.from('payroll_runs').select('*').eq('id', runId).single()
    const { data: items } = await supabase
        .from('payroll_items')
        .select(`
            *,
            staff:profiles(first_name, last_name, photo_url, role)
        `)
        .eq('payroll_run_id', runId)

    return { success: true, data: { run, items } }
}

/**
 * Update Salary Structure
 */
export async function upsertSalaryStructure(staffId: string, data: any) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Profile not found" }

        const { error } = await supabase
            .from('salary_structures')
            .upsert({
                tenant_id: profile.tenant_id,
                staff_id: staffId,
                ...data
            }, { onConflict: 'staff_id' })

        if (error) throw error
        return { success: true }

    } catch (error) {
        return { success: false, error: "Failed to save salary structure" }
    }
}
/**
 * Get Payroll Reconciliation Report Data
 */
export async function getPayrollReconciliationReport(month: string, year: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1
    const monthStr = monthIndex.toString().padStart(2, '0')
    const startDate = `${year}-${monthStr}-01`
    const endDate = `${year}-${monthStr}-31`

    // 1. Fetch Staff
    const { data: staffList } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('tenant_id', profile.tenant_id)
        .in('role', ['teacher', 'admin', 'principal', 'bursar'])

    // 2. Fetch Attendance
    const { data: attendance } = await supabase
        .from('staff_attendance')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .gte('date', startDate)
        .lte('date', endDate)

    // 3. Fetch Disputes (Directly from staff_attendance_disputes if needed, 
    // or we can rely on verification_method='manual_override' metadata in staff_attendance)
    // To be precise with "Forensic Detail", we should fetch the disputes to get Principal notes.
    const { data: disputes } = await supabase
        .from('staff_attendance_disputes')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'approved')

    const report = staffList?.map(staff => {
        const staffAttendance = attendance?.filter(a => a.staff_id === staff.id) || []
        const daysPresent = staffAttendance.filter(a => a.status === 'present').length

        const overrides = staffAttendance
            .filter(a => a.verification_method === 'manual_override')
            .map(a => {
                // Find associated dispute for notes
                const dispute = disputes?.find(d => d.id === a.metadata?.dispute_id)
                return {
                    date: a.date,
                    distance: a.metadata?.original_distance || 0,
                    principalNote: "Principal Verified via Dispute Hub" // We can add resolved_notes if we add it to schema
                }
            })

        return {
            id: staff.id,
            name: staff.full_name,
            role: staff.role,
            daysPresent,
            totalDays: 20, // Should ideally be calculated based on working days
            flags: overrides.length,
            overrideDetails: overrides
        }
    })

    return { success: true, data: report }
}
