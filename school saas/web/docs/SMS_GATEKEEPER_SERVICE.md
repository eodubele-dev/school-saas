# SMS Gatekeeper Service - Technical Documentation

## Overview
The **SMS Gatekeeper Service** acts as an intelligent filter between your application logic and SMS gateway, enforcing notification settings and wallet balance checks before dispatching any messages. This ensures institutional discipline, forensic precision, and cost optimization.

---

## Architecture

### Gatekeeper Flow
```
Application Logic
    ↓
SMS Gatekeeper Service
    ↓
1. Check if event is system-critical
2. Check notification settings (if not critical)
3. Validate wallet balance
4. Log transaction (auto-deducts balance)
5. Dispatch to SMS gateway
    ↓
SMS Provider (Termii/AfricasTalking)
```

---

## Key Features

### 1. **System-Critical Event Bypass**
Certain events always send, regardless of user settings:
- `security_alerts` - Emergency lockdowns, unauthorized access
- `forensic_grade_changes` - Grade modification audit notifications

### 2. **Notification Settings Enforcement**
Before sending, checks `notification_settings` table:
- If event is disabled → **SKIPPED** (logged for analytics)
- If event is enabled → Proceeds to wallet check

### 3. **Wallet Balance Validation**
Prevents overdraft and failed gateway attempts:
- Checks `tenants.sms_balance` before dispatch
- Returns `INSUFFICIENT_FUNDS` if balance < cost
- Auto-deducts via database trigger on successful log

### 4. **Forensic Logging**
Every action is tracked:
- **Sent**: Logged in `sms_transactions` table
- **Skipped**: Logged in `sms_skipped_log` table (optional)
- **Failed**: Error reason returned to caller

---

## API Reference

### `SMSGatekeeperService.sendAutomatedSMS()`

**Purpose**: Send SMS with gatekeeper enforcement

**Parameters**:
```typescript
eventType: SMSEventType        // Type of notification
recipientName: string          // Recipient name
recipientPhone: string         // Phone number
message: string                // SMS content
metadata?: Record<string, any> // Optional context
```

**Returns**:
```typescript
{
    status: 'SENT' | 'SKIPPED' | 'FAILED'
    reason?: string              // Why it was skipped/failed
    transactionId?: string       // Gateway message ID
    cost?: number                // SMS cost (₦5.00)
}
```

**Example**:
```typescript
const result = await SMSGatekeeperService.sendAutomatedSMS(
    'fee_reminders',
    'Mrs. Adebayo',
    '08012345678',
    'Your child\'s fees are overdue. Pay now: [LINK]'
)

if (result.status === 'SENT') {
    console.log('SMS sent successfully')
} else if (result.status === 'SKIPPED') {
    console.log('SMS skipped:', result.reason)
}
```

---

## Convenience Wrappers

### `sendFeeReminder()`
```typescript
await sendFeeReminder(
    'Mrs. Ibrahim',
    '08123456789',
    50000,
    '2026-02-15'
)
```

### `sendAttendanceAlert()`
```typescript
await sendAttendanceAlert(
    'Mr. Okonkwo',
    '08134567890',
    'Chioma Okonkwo',
    'clock_in'
)
```

### `sendSecurityAlert()`
```typescript
// ALWAYS sends (critical event)
await sendSecurityAlert(
    'Proprietor',
    '08145678901',
    'Unauthorized access detected in Grade 5 classroom'
)
```

### `sendForensicGradeChangeAlert()`
```typescript
// ALWAYS sends (critical event)
await sendForensicGradeChangeAlert(
    'Mrs. Eze',
    '08156789012',
    'Emeka Eze',
    'Mathematics',
    'B',
    'A',
    'Mr. Johnson (Teacher)'
)
```

---

## Event Types

| Event Type | Category | Can Be Disabled? | Est. Volume/Month |
|-----------|----------|------------------|-------------------|
| `fee_reminders` | Financial | ✅ Yes | 4 SMS/student |
| `payment_confirmations` | Financial | ✅ Yes | 2 SMS/student |
| `outstanding_balance_alerts` | Financial | ✅ Yes | 8 SMS/student |
| `attendance_clock_in` | Safety | ✅ Yes | 20 SMS/student |
| `attendance_clock_out` | Safety | ✅ Yes | 20 SMS/student |
| `absence_alerts` | Safety | ✅ Yes | 4 SMS/student |
| `result_published` | Academic | ✅ Yes | 3 SMS/student |
| `grade_updates` | Academic | ✅ Yes | 2 SMS/student |
| `assignment_reminders` | Academic | ✅ Yes | 12 SMS/student |
| `bus_arrival_alerts` | Logistics | ✅ Yes | 20 SMS/student |
| `bus_departure_alerts` | Logistics | ✅ Yes | 20 SMS/student |
| `maintenance_updates` | Logistics | ✅ Yes | 2 SMS/student |
| `security_alerts` | Critical | ❌ **NO** | 1 SMS/student |
| `forensic_grade_changes` | Critical | ❌ **NO** | 0.5 SMS/student |

---

## Integration Examples

### Example 1: Fee Payment Flow
```typescript
// In your payment reminder cron job
import { sendFeeReminder } from '@/lib/services/sms-gatekeeper'

async function sendOverdueReminders() {
    const overdueStudents = await getOverdueStudents()
    
    for (const student of overdueStudents) {
        const result = await sendFeeReminder(
            student.parent_name,
            student.parent_phone,
            student.balance,
            student.due_date
        )
        
        if (result.status === 'SKIPPED') {
            console.log(`Reminder skipped for ${student.parent_name}: ${result.reason}`)
            // School has disabled fee reminders - respect their choice
        } else if (result.status === 'FAILED') {
            console.error(`Failed to send reminder: ${result.reason}`)
            // Handle error (e.g., low balance alert to admin)
        }
    }
}
```

### Example 2: Attendance Tracking
```typescript
// In your attendance clock-in handler
import { sendAttendanceAlert } from '@/lib/services/sms-gatekeeper'

async function handleStudentClockIn(studentId: string) {
    const student = await getStudent(studentId)
    
    // Log attendance in database
    await logAttendance(studentId, 'clock_in')
    
    // Send parent notification (respects settings)
    const result = await sendAttendanceAlert(
        student.parent_name,
        student.parent_phone,
        student.full_name,
        'clock_in'
    )
    
    // Gatekeeper handles the rest - no need to check settings manually
}
```

### Example 3: Grade Change Audit
```typescript
// In your grade update handler
import { sendForensicGradeChangeAlert } from '@/lib/services/sms-gatekeeper'

async function updateStudentGrade(
    studentId: string,
    subject: string,
    newGrade: string,
    teacherId: string
) {
    const student = await getStudent(studentId)
    const teacher = await getTeacher(teacherId)
    const oldGrade = student.grades[subject]
    
    // Update grade in database
    await updateGrade(studentId, subject, newGrade)
    
    // ALWAYS send forensic alert (critical event)
    await sendForensicGradeChangeAlert(
        student.parent_name,
        student.parent_phone,
        student.full_name,
        subject,
        oldGrade,
        newGrade,
        teacher.full_name
    )
    
    // This will send even if user has "disabled" it in settings
    // because it's a system-critical forensic audit requirement
}
```

---

## Analytics: SMS Savings Report

### View Skipped Notifications
```sql
SELECT 
    event_type,
    COUNT(*) as times_skipped,
    COUNT(*) * 5.00 as naira_saved
FROM sms_skipped_log
WHERE tenant_id = '<your-tenant-id>'
    AND skipped_at >= NOW() - INTERVAL '30 days'
GROUP BY event_type
ORDER BY naira_saved DESC;
```

**Example Output**:
```
event_type              | times_skipped | naira_saved
------------------------|---------------|-------------
bus_arrival_alerts      | 600           | ₦3,000.00
bus_departure_alerts    | 600           | ₦3,000.00
assignment_reminders    | 360           | ₦1,800.00
TOTAL                   | 1,560         | ₦7,800.00
```

### Monthly Savings Dashboard
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getMonthlySavings() {
    const supabase = createClient()
    
    const { data } = await supabase
        .from('sms_savings_report')
        .select('*')
        .order('month', { ascending: false })
        .limit(6)
    
    return data
}
```

---

## SMS Gateway Integration

### Current Status
The service currently **simulates** SMS dispatch. To integrate with a real provider:

### Option 1: Termii (Recommended for Nigeria)
```typescript
private static async sendToSMSGateway(phone: string, message: string) {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: phone,
            from: process.env.TERMII_SENDER_ID,
            sms: message,
            type: 'plain',
            channel: 'generic',
            api_key: process.env.TERMII_API_KEY
        })
    })
    
    const result = await response.json()
    
    return {
        success: result.message === 'Successfully Sent',
        messageId: result.message_id,
        error: result.message !== 'Successfully Sent' ? result.message : undefined
    }
}
```

### Option 2: AfricasTalking
```typescript
import AfricasTalking from 'africastalking'

const client = AfricasTalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME
})

private static async sendToSMSGateway(phone: string, message: string) {
    try {
        const result = await client.SMS.send({
            to: [phone],
            message,
            from: process.env.AT_SENDER_ID
        })
        
        return {
            success: result.SMSMessageData.Recipients[0].status === 'Success',
            messageId: result.SMSMessageData.Recipients[0].messageId
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        }
    }
}
```

---

## Security Considerations

### 1. **Critical Event Protection**
- Hard-coded in service logic
- Cannot be bypassed via API calls
- Database CHECK constraint as backup

### 2. **Balance Validation**
- Checked before gateway call
- Prevents failed attempts at carrier level
- Maintains clean transaction history

### 3. **Audit Trail**
- Every sent/skipped/failed SMS is logged
- Immutable transaction records
- Forensic-grade accountability

---

## Testing

### Test 1: Disabled Event (Should Skip)
```typescript
// 1. Disable fee reminders in settings
await updateNotificationSettings({ fee_reminders: false })

// 2. Attempt to send fee reminder
const result = await sendFeeReminder('Test Parent', '08012345678', 5000, '2026-02-15')

// 3. Verify result
expect(result.status).toBe('SKIPPED')
expect(result.reason).toBe('USER_CONFIG_DISABLED')

// 4. Check skipped log
const skipped = await supabase
    .from('sms_skipped_log')
    .select('*')
    .eq('event_type', 'fee_reminders')
    .single()

expect(skipped).toBeDefined()
```

### Test 2: Critical Event (Should Always Send)
```typescript
// 1. Attempt to disable security alerts (will fail at DB level)
await updateNotificationSettings({ security_alerts: false })
// ^ This will be rejected by RLS policy

// 2. Send security alert
const result = await sendSecurityAlert('Proprietor', '08012345678', 'Test alert')

// 3. Verify it sent despite any settings
expect(result.status).toBe('SENT')
```

### Test 3: Insufficient Balance (Should Fail)
```typescript
// 1. Set balance to zero
await supabase
    .from('tenants')
    .update({ sms_balance: 0 })
    .eq('id', tenantId)

// 2. Attempt to send SMS
const result = await sendFeeReminder('Test Parent', '08012345678', 5000, '2026-02-15')

// 3. Verify failure
expect(result.status).toBe('FAILED')
expect(result.reason).toBe('INSUFFICIENT_FUNDS')
```

---

## Migration Checklist

- [x] Apply `sms_transaction_log.sql`
- [x] Apply `sms_wallet_trigger.sql`
- [x] Apply `notification_settings.sql`
- [ ] Apply `sms_skipped_log.sql` (optional, for analytics)
- [x] Create `lib/services/sms-gatekeeper.ts`
- [ ] Integrate SMS gateway (Termii/AfricasTalking)
- [ ] Update environment variables with API keys

---

**Last Updated**: 2026-02-05  
**Version**: 1.0.0  
**Status**: Production Ready (Gateway integration pending)
