"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { logActivity } from "./audit"

// --- Fee Categories ---

export async function upsertFeeCategory(data: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false, error: "Tenant context missing" }
    if (!['admin', 'bursar'].includes(profile?.role)) return { success: false, error: "Permission denied" }

    const { error } = await supabase
        .from('fee_categories')
        .upsert({ ...data, tenant_id: profile.tenant_id })

    if (error) return { success: false, error: error.message }

    await logActivity(
        'Financial',
        'FEE_CATEGORY_UPDATE',
        `Fee category updated: ${data.name}`,
        'fee_category',
        undefined,
        null,
        data
    )

    return { success: true }
}

export async function deleteFeeCategory(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('fee_categories').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    return { success: true }
}

// --- Fee Schedule (Matrix) ---

export async function updateFeeSchedule(updates: any[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false, error: "Tenant context missing" }
    if (!['admin', 'bursar'].includes(profile?.role)) return { success: false, error: "Permission denied" }

    const data = updates.map(u => ({ ...u, tenant_id: profile.tenant_id }))

    const { error } = await supabase
        .from('fee_schedule')
        .upsert(data, { onConflict: 'class_id, category_id' })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

// --- Invoice Generation ---

export async function generateTermlyInvoices(domain: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'bursar'].includes(profile.role)) return { success: false, error: "Permission denied" }

    // 1. Get Active Session
    const { data: session } = await supabase
        .from('academic_sessions')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)
        .single()

    if (!session) return { success: false, error: "No active academic session found." }

    // 2. Get Fee Categories & Schedule
    const { data: schedule } = await supabase
        .from('fee_schedule')
        .select('class_id, amount, category_id, category:fee_categories(name, is_mandatory)')
        .eq('tenant_id', profile.tenant_id)

    if (!schedule || schedule.length === 0) return { success: false, error: "Fee schedule is empty. Configure fees first." }

    // Group fees by class
    const feesByClass: Record<string, any[]> = {} // class_id -> [{ name, amount, is_mandatory, id }]
    schedule.forEach((item: any) => {
        if (!feesByClass[item.class_id]) feesByClass[item.class_id] = []
        if (item.amount > 0) {
            feesByClass[item.class_id].push({
                category_id: item.category_id,
                description: item.category.name,
                amount: Number(item.amount),
                is_mandatory: item.category.is_mandatory
            })
        }
    })

    // 3. Get Active Students (with Class)
    const { data: students } = await supabase
        .from('students')
        .select('id, class_id')
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'active') // Assuming active status column exists or we just take all

    if (!students || students.length === 0) return { success: false, error: "No active students found." }

    // 4. Fetch Existing Invoices to prevent duplicates
    const currentTermString = `${session.session} ${session.term}`
    const { data: existingInvoices } = await supabase
        .from('invoices')
        .select('student_id')
        .eq('tenant_id', profile.tenant_id)
        .eq('term', currentTermString)

    const existingStudentIds = new Set((existingInvoices || []).map(inv => inv.student_id))

    // 5. Generate Invoices
    const invoices = []
    let skipCount = 0

    // Fetch Addons and Exemptions for the current tenant
    const { data: addons } = await supabase.from('student_fee_addons').select('student_id, category_id').eq('tenant_id', profile.tenant_id)
    const { data: exemptions } = await supabase.from('student_fee_exemptions').select('student_id, category_id').eq('tenant_id', profile.tenant_id)

    // Build Maps for O(1) lookups
    const addonsMap: Record<string, Set<string>> = {}
    addons?.forEach(a => {
        if (!addonsMap[a.student_id]) addonsMap[a.student_id] = new Set()
        addonsMap[a.student_id].add(a.category_id)
    })
    const exemptionsMap: Record<string, Set<string>> = {}
    exemptions?.forEach(e => {
        if (!exemptionsMap[e.student_id]) exemptionsMap[e.student_id] = new Set()
        exemptionsMap[e.student_id].add(e.category_id)
    })

    for (const student of students) {
        if (!student.class_id || !feesByClass[student.class_id] || existingStudentIds.has(student.id)) {
            skipCount++
            continue
        }

        const classFees = feesByClass[student.class_id]

        // Filter fees based on mandatory rules, addons, and exemptions
        const studentSpecificItems = classFees.filter(fee => {
            const isExempt = exemptionsMap[student.id]?.has(fee.category_id)
            if (isExempt) return false // Skip if specifically waived

            const isAddon = addonsMap[student.id]?.has(fee.category_id)
            if (fee.is_mandatory) return true // Bill if mandatory (and not waived)
            if (isAddon) return true // Bill if optional but opted-in

            return false // Skip if optional and not opted-in
        }) // We map the result below to strip out backend keys before insertion

        if (studentSpecificItems.length === 0) {
            skipCount++
            continue
        }

        const finalItems = studentSpecificItems.map(f => ({ description: f.description, amount: f.amount }))
        const total = finalItems.reduce((sum, item) => sum + item.amount, 0)

        invoices.push({
            tenant_id: profile.tenant_id,
            student_id: student.id,
            term: `${session.session} ${session.term}`,
            amount: total,
            status: 'pending',
            items: finalItems // JSONB Array
        })
    }

    if (invoices.length === 0) return { success: false, error: "No invoices generated. Check student classes and fee configuration." }

    // Batch Insert (Chunking if large, but assuming < 1000 for now or Supabase handles reasonably sized batches)
    const { error } = await supabase.from('invoices').insert(invoices)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/${domain}/dashboard`)
    return { success: true, count: invoices.length, skipped: skipCount }
}

// --- Bursar Dashboard Stats ---

export async function getBursarStats() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'bursar'].includes(profile.role)) return null

    const tenantId = profile.tenant_id

    // 1. Fetch Invoices for expected revenue (all time or current session?)
    // Prompt says "current term". We need the active session term.
    const { data: session } = await supabase
        .from('academic_sessions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single()

    const termLabel = session ? `${session.session} ${session.term}` : null

    let invoiceQuery = supabase.from('invoices').select('amount, amount_paid').eq('tenant_id', tenantId)
    if (termLabel) invoiceQuery = invoiceQuery.eq('term', termLabel)

    const { data: invoices } = await invoiceQuery

    const totalExpected = (invoices || []).reduce((sum, inv) => sum + Number(inv.amount), 0)
    const totalCollected = (invoices || []).reduce((sum, inv) => sum + Number(inv.amount_paid), 0)
    const outstanding = totalExpected - totalCollected
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0

    // 1b. Calculate Trend (Last 30 days vs Previous 30 days)
    // 1b. Calculate Trend (Last 30 days vs Previous 30 days)
    const today = new Date()
    const trendThirtyDaysAgo = new Date(today)
    trendThirtyDaysAgo.setDate(today.getDate() - 30)
    const trendSixtyDaysAgo = new Date(today)
    trendSixtyDaysAgo.setDate(today.getDate() - 60)

    const { data: currentPeriod } = await supabase
        .from('transactions')
        .select('amount')
        .eq('tenant_id', tenantId)
        .gte('date', trendThirtyDaysAgo.toISOString())

    const { data: previousPeriod } = await supabase
        .from('transactions')
        .select('amount')
        .eq('tenant_id', tenantId)
        .gte('date', trendSixtyDaysAgo.toISOString())
        .lt('date', trendThirtyDaysAgo.toISOString())

    const currentSum = (currentPeriod || []).reduce((sum, t) => sum + Number(t.amount), 0)
    const previousSum = (previousPeriod || []).reduce((sum, t) => sum + Number(t.amount), 0)

    let trendValue = 0
    if (previousSum === 0) {
        trendValue = currentSum > 0 ? 100 : 0
    } else {
        trendValue = Math.round(((currentSum - previousSum) / previousSum) * 100)
    }
    const trendLabel = trendValue > 0 ? `+${trendValue}%` : `${trendValue}%`

    // 2. Fetch Recent Transactions
    // Only fetch un-reconciled transactions for the alerts panel
    const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            method,
            date,
            reference,
            students (full_name)
        `)
        .eq('tenant_id', tenantId)
        .is('is_reconciled', false)
        .order('date', { ascending: false })
        .limit(5)

    // 3. Fetch Daily Collections (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: dailyData } = await supabase
        .from('transactions')
        .select('amount, date')
        .eq('tenant_id', tenantId)
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date', { ascending: true })

    // Group by date for the chart
    const dailyCollections: Record<string, number> = {}
    dailyData?.forEach(trx => {
        const d = new Date(trx.date).toISOString().split('T')[0]
        dailyCollections[d] = (dailyCollections[d] || 0) + Number(trx.amount)
    })

    const chartData = Object.entries(dailyCollections).map(([date, amount]) => ({
        date,
        amount
    })).slice(-30)

    // 4. Fetch SMS Transactions (Forensic Ledger)
    const { data: smsLogs } = await supabase
        .from('sms_transactions')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sent_at', { ascending: false })
        .limit(50)

    const smsTransactions = smsLogs?.map((log: any) => ({
        id: log.id,
        parentName: log.recipient_name,
        phone: log.recipient_phone,
        type: log.message_type,
        status: (log.status.charAt(0).toUpperCase() + log.status.slice(1)) as 'Delivered' | 'Pending' | 'Failed',
        cost: Number(log.cost),
        timestamp: log.sent_at
    })) || []

    // 5. Get SMS Wallet Balance
    let smsBalance = 0
    const { data: tenant } = await supabase.from('tenants').select('sms_balance').eq('id', tenantId).single()
    smsBalance = tenant?.sms_balance || 0

    return {
        metrics: {
            totalExpected,
            totalCollected,
            outstanding,
            collectionRate,
            collectionTrend: trendLabel
        },
        recentTransactions: recentTransactions || [],
        smsTransactions,
        smsBalance,
        chartData,
        term: termLabel || "N/A"
    }
}

export async function recordManualPayment(data: {
    studentId: string,
    invoiceId: string,
    amount: number,
    method: string,
    reference?: string
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'bursar'].includes(profile.role)) return { success: false, error: "Permission denied" }

    const tenantId = profile.tenant_id
    const adminClient = createAdminClient()

    // 1. Record Transaction
    const { error: trxError } = await adminClient.from('transactions').insert({
        tenant_id: tenantId,
        invoice_id: data.invoiceId,
        student_id: data.studentId,
        amount: data.amount,
        method: data.method,
        reference: data.reference,
        status: 'success',
        date: new Date().toISOString()
    })

    if (trxError) return { success: false, error: trxError.message }

    // 2. Update Invoice amount_paid
    const { data: invoice } = await adminClient.from('invoices').select('amount, amount_paid').eq('id', data.invoiceId).single()
    if (invoice) {
        const newPaid = Number(invoice.amount_paid) + Number(data.amount)
        const isPaid = newPaid >= Number(invoice.amount)

        const { error: invoiceUpdateError } = await adminClient.from('invoices').update({
            amount_paid: newPaid,
            status: isPaid ? 'paid' : 'partial'
        }).eq('id', data.invoiceId)

        if (invoiceUpdateError) {
            console.error("[recordManualPayment] Invoice Update Failed:", invoiceUpdateError);
            return { success: false, error: "Payment recorded but invoice sync failed: " + invoiceUpdateError.message }
        }
    }

    revalidatePath(`/dashboard/bursar`)
    return { success: true }
}

export async function reconcileTransaction(transactionId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'bursar'].includes(profile.role)) return { success: false, error: "Permission denied" }

    const tenantId = profile.tenant_id
    const adminClient = createAdminClient()

    const { error } = await adminClient.from('transactions')
        .update({ is_reconciled: true })
        .eq('id', transactionId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/dashboard/bursar`)
    return { success: true }
}

// --- Parent/Student Portal Helpers ---

export async function getStudentBilling(studentId: string, session: string, term: string) {
    const supabase = createClient()

    // We target the invoices table instead of a non-existent 'billing' table
    // Fetch the specific invoice for this session/term
    const termLabel = `${session} ${term}`

    const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('student_id', studentId)
        .eq('term', termLabel)
        .single()

    if (!invoice) {
        // Fallback or "No Invoice Yet"
        return {
            balance: 0,
            total_fees: 0,
            breakdown: { tuition: 0, bus: 0, uniform: 0 },
            status: 'paid'
        }
    }

    const balance = Number(invoice.amount) - Number(invoice.amount_paid)

    // Parse items for breakdown if JSONB
    const items = invoice.items as any[] || []
    const breakdown: Record<string, number> = { tuition: 0, bus: 0, uniform: 0, development: 0, books: 0 }

    items.forEach(item => {
        const desc = item.description?.toLowerCase() || ""
        if (desc.includes('tuition')) breakdown.tuition += item.amount
        else if (desc.includes('bus') || desc.includes('transport')) breakdown.bus += item.amount
        else if (desc.includes('uniform')) breakdown.uniform += item.amount
        else if (desc.includes('dev') || desc.includes('levy')) breakdown.development += item.amount
        else if (desc.includes('book')) breakdown.books += item.amount
    })

    return {
        balance,
        total_fees: invoice.amount,
        breakdown,
        status: invoice.status
    }
}

export async function getPaymentHistory(studentId: string) {
    const supabase = createClient()

    const { data: history } = await supabase
        .from('transactions')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })

    return history || []
}

export async function generatePaystackLink(userType: string, amount: number, email: string) {
    // In a real production app, this would make a server-side request to Paystack API
    // to initialize a transaction and get an authorization URL.

    // For this demo/prototype:
    // We return a specialized Paystack Test Checkout URL or a mock success URL
    // If we want to simulate a real flow, we can use a standard Paystack test page if available,
    // or just return a dummy URL that the frontend 'simulates' opening.

    // However, the frontend currently does: window.open(link, '_blank')
    // Let's return a real-looking but safe URL.
    // If we have a public key, we might construct a client-side link, but server-side init is better.

    return `https://checkout.paystack.com/qa/pay/demo-${Date.now()}`
    // OR just return a success page from our own app?
    // User wants to see "Redirecting to Paystack".
    // Let's use a placeholder URL that looks legitimate.

    // If we want to actually test payment, we'd need keys. 
    // Assuming simple demo:
    return "https://paystack.com/pay/school-saas-demo"
}

// --- Bursar Utilities ---

export async function getSMSWalletBalance() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, balance: 0, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, balance: 0, error: "Profile not found" }

    const { data: tenant } = await supabase.from('tenants').select('sms_balance').eq('id', profile.tenant_id).single()
    return { success: true, balance: tenant?.sms_balance || 0 }
}

// --- Optional Fee Overrides ---

export async function getStudentFeeOverrides(classId?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    // Fetch students
    let studentQuery = supabase
        .from('students')
        .select(`
            id,
            full_name,
            class_id,
            class:classes(name),
            addons:student_fee_addons(category_id),
            exemptions:student_fee_exemptions(category_id)
        `)
        .eq('tenant_id', profile.tenant_id)

    if (classId && classId !== 'all') {
        studentQuery = studentQuery.eq('class_id', classId)
    }

    const { data: students, error } = await studentQuery
    if (error) return { success: false, error: error.message }

    // Fetch active categories
    const { data: categories } = await supabase
        .from('fee_categories')
        .select('id, name, is_mandatory')
        .eq('tenant_id', profile.tenant_id)

    return { success: true, students, categories }
}

export async function toggleFeeOverride(studentId: string, categoryId: string, type: 'addon' | 'exemption', isActive: boolean) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const tableName = type === 'addon' ? 'student_fee_addons' : 'student_fee_exemptions'

    if (isActive) {
        const { error } = await supabase.from(tableName).upsert({
            tenant_id: profile.tenant_id,
            student_id: studentId,
            category_id: categoryId
        })
        if (error) return { success: false, error: error.message }
    } else {
        const { error } = await supabase.from(tableName)
            .delete()
            .eq('student_id', studentId)
            .eq('category_id', categoryId)
        if (error) return { success: false, error: error.message }
    }

    return { success: true }
}

export async function getPendingReconciliations() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, count: 0 }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, count: 0 }

    const { count, error } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', profile.tenant_id)
        .eq('status', 'pending')

    if (error) return { success: false, count: 0 }

    return { success: true, count: count || 0 }
}

export async function getDebtorStudents() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, data: [] }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, data: [] }

    const { data, error } = await supabase
        .from('invoices')
        .select(`
            id,
            amount,
            amount_paid,
            term,
            student:students (
                id,
                full_name,
                admission_number,
                classes(name)
            )
        `)
        .eq('tenant_id', profile.tenant_id)
        .neq('status', 'paid')

    if (error) return { success: false, data: [] }

    const debtors = (data || []).map(inv => ({
        id: (inv.student as any)?.id,
        name: (inv.student as any)?.full_name,
        admission_number: (inv.student as any)?.admission_number,
        class: Array.isArray((inv.student as any)?.classes) && (inv.student as any)?.classes.length > 0 ? (inv.student as any).classes[0].name : "N/A",
        amount_due: Number(inv.amount) - (Number(inv.amount_paid) || 0),
        term: inv.term
    })).filter(d => d.amount_due > 0)

    return {
        success: true,
        data: debtors
    }
}
