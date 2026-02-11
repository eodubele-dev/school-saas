/**
 * Communication Hub Constants
 * Centralized governance for SMS pricing and volume estimates.
 */

export const SMS_CONFIG = {
    // Pricing (in Naira)
    UNIT_COST: 5, // Standard rate charged to schools

    // Monthly Volume Estimates (SMS per student per month)
    ESTIMATES: {
        fee_reminders: 4,
        payment_confirmations: 2,
        outstanding_balance_alerts: 8,
        attendance_clock_in: 20,
        attendance_clock_out: 20,
        absence_alerts: 4,
        result_published: 3,
        grade_updates: 2,
        assignment_reminders: 12,
        bus_arrival_alerts: 20,
        bus_departure_alerts: 20,
        maintenance_updates: 2,
        security_alerts: 1,
        forensic_grade_changes: 0.5
    }
}
