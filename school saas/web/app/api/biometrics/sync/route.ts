import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// MOCK API KEY for simplicity - in prod use env variable
const BIOMETRIC_API_KEY = process.env.BIOMETRIC_API_KEY || "zkteco-secret-key-123"

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization')

    // 1. Validate API Key
    if (authHeader !== `Bearer ${BIOMETRIC_API_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { device_id, logs } = body // Expecting array of logs

        if (!Array.isArray(logs)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
        }

        const supabase = createClient()

        // 2. Process Logs
        const results = { success: 0, failed: 0 }

        for (const log of logs) {
            const { biometric_id, timestamp, scan_type } = log

            // Find Staff by biometric_id
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, tenant_id')
                .eq('biometric_id', biometric_id)
                .single()

            if (profile) {
                // Log raw data
                await supabase.from('biometric_logs').insert({
                    tenant_id: profile.tenant_id,
                    device_id,
                    biometric_staff_id: biometric_id,
                    matched_staff_id: profile.id,
                    timestamp,
                    scan_type: scan_type || 'check_in',
                    raw_data: log
                })

                // Update Attendance Table
                const date = new Date(timestamp).toISOString().split('T')[0]
                const time = new Date(timestamp).toTimeString().split(' ')[0]

                const updateData: any = {
                    tenant_id: profile.tenant_id,
                    staff_id: profile.id,
                    date: date,
                    status: 'present',
                    location_verified: true, // Trusted device
                }

                if (scan_type === 'check_out') {
                    updateData.check_out_time = time
                } else {
                    updateData.check_in_time = time
                }

                const { error } = await supabase
                    .from('staff_attendance')
                    .upsert(updateData, { onConflict: 'staff_id,date' })

                if (!error) results.success++
                else results.failed++

            } else {
                // Log unknown user scan
                await supabase.from('biometric_logs').insert({
                    // tenant_id?? We might need to look up device ownership if multi-tenant
                    // For now assuming device is tied to known context or we skip
                    // skipping for safety if tenant unknown
                    tenant_id: '00000000-0000-0000-0000-000000000000', // Warning: Needs valid UUID
                    device_id,
                    biometric_staff_id: biometric_id,
                    timestamp,
                    scan_type: scan_type || 'check_in',
                    raw_data: log
                })
                results.failed++
            }
        }

        return NextResponse.json({ message: 'Sync complete', results })

    } catch (error) {
        console.error("Biometric sync error:", error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
