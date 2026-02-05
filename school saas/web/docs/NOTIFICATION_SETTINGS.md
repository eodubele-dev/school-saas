# Parent Notification Settings System

## Overview
The **Notification Engine** provides granular control over automated SMS triggers, enabling schools to balance high-engagement "Platinum" service with disciplined SMS wallet management. Administrators can toggle specific event notifications while system-critical alerts remain permanently enabled to maintain forensic audit standards.

---

## Key Features

### 1. **Granular Event Control**
Every high-stakes event has a dedicated toggle:
- **Financial & Revenue**: Fee reminders, payment confirmations, balance alerts
- **Safety & Attendance**: Clock-in/out alerts, absence notifications
- **Academic Progress**: Result publications, grade updates
- **Logistics**: Bus tracking, facility maintenance updates

### 2. **Wallet Impact Preview**
- **Monthly Volume Estimates**: Each setting displays estimated SMS volume per student
- **Cost Projections**: Real-time calculation of monthly SMS costs
- **Budget Planning**: Helps Bursar predict wallet depletion rates

### 3. **System-Critical Protections**
Certain alerts cannot be disabled to maintain institutional integrity:
- **Forensic Security Alerts**: Emergency lockdowns, unauthorized access
- **Forensic Grade Changes**: Mandatory notifications for grade modifications
- **Visual Indicators**: Lock icon and cyan highlight for protected settings

---

## Database Schema

```sql
CREATE TABLE public.notification_settings (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL UNIQUE,
    
    -- Financial & Revenue
    fee_reminders BOOLEAN DEFAULT true,
    payment_confirmations BOOLEAN DEFAULT true,
    outstanding_balance_alerts BOOLEAN DEFAULT true,
    
    -- Safety & Attendance
    attendance_clock_in BOOLEAN DEFAULT true,
    attendance_clock_out BOOLEAN DEFAULT true,
    absence_alerts BOOLEAN DEFAULT true,
    
    -- Academic
    result_published BOOLEAN DEFAULT true,
    grade_updates BOOLEAN DEFAULT false,
    assignment_reminders BOOLEAN DEFAULT false,
    
    -- Logistics
    bus_arrival_alerts BOOLEAN DEFAULT false,
    bus_departure_alerts BOOLEAN DEFAULT false,
    maintenance_updates BOOLEAN DEFAULT false,
    
    -- System Critical (Cannot be disabled)
    security_alerts BOOLEAN DEFAULT true,
    forensic_grade_changes BOOLEAN DEFAULT true,
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID
);
```

### Auto-Initialization
New tenants automatically receive default notification settings via trigger:
```sql
CREATE TRIGGER trigger_create_notification_settings
    AFTER INSERT ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_settings();
```

---

## Server Actions

### `getNotificationSettings()`
Fetches current notification preferences for the authenticated tenant.

**Access**: Admin, Proprietor, Bursar

**Returns**:
```typescript
{
    success: boolean
    settings: NotificationSettings | null
    error?: string
}
```

### `updateNotificationSettings(updates)`
Updates notification preferences with system-critical protection.

**Access**: Admin, Proprietor only

**Parameters**:
```typescript
Partial<NotificationSettings>
```

**Behavior**:
- Automatically enforces `security_alerts = true`
- Automatically enforces `forensic_grade_changes = true`
- Records `updated_by` and `updated_at` for audit trail

### `getMonthlyVolumeEstimates()`
Returns estimated SMS volume per student per month for each notification type.

**Returns**:
```typescript
{
    fee_reminders: 4,
    payment_confirmations: 2,
    attendance_clock_in: 20,
    // ... etc
}
```

---

## UI Component

### NotificationSettings Component
**Location**: `components/settings/notification-settings.tsx`

**Features**:
- **Category Organization**: Settings grouped by function (Financial, Safety, Academic, Logistics)
- **Real-Time Updates**: Instant toggle with optimistic UI updates
- **Volume Calculator**: Live total monthly SMS estimate
- **Cost Preview**: Displays estimated monthly cost per student
- **Toast Notifications**: Success/error feedback for all actions
- **Loading States**: Skeleton UI during data fetch
- **Disabled State**: Visual feedback for system-critical alerts

**Props**: None (fetches data internally)

---

## Monthly Volume Estimates

| Notification Type | Est. SMS/Student/Month | Use Case |
|------------------|------------------------|----------|
| Fee Reminders | 4 | Weekly overdue alerts |
| Payment Confirmations | 2 | Bi-weekly receipts |
| Outstanding Balance | 8 | Twice-weekly debt alerts |
| Clock-In Alerts | 20 | Daily arrival notifications |
| Clock-Out Alerts | 20 | Daily departure notifications |
| Absence Alerts | 4 | As-needed truancy alerts |
| Result Published | 3 | Per-term result releases |
| Grade Updates | 2 | Occasional assessment changes |
| Assignment Reminders | 12 | 3x per week homework alerts |
| Bus Arrival | 20 | Daily pickup notifications |
| Bus Departure | 20 | Daily drop-off notifications |
| Maintenance Updates | 2 | Occasional facility alerts |
| Security Alerts | 1 | Rare emergency notifications |
| Forensic Grade Changes | 0.5 | Very rare audit alerts |

**Note**: Actual volumes vary based on student count, attendance patterns, and payment behavior.

---

## Security & RLS

### View Access
```sql
-- Admins, Proprietors, and Bursars can view settings
tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'proprietor', 'bursar')
)
```

### Update Access
```sql
-- Only Admins and Proprietors can modify settings
tenant_id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'proprietor')
)
-- WITH CHECK: security_alerts = true AND forensic_grade_changes = true
```

### System-Critical Protection
The database enforces that critical alerts cannot be disabled:
- `WITH CHECK` clause validates on UPDATE
- Server action double-checks before submission
- UI disables toggle buttons for critical alerts

---

## Integration Points

### Sidebar Navigation
- **Admin**: System → SMS Notifications
- **Bursar**: System → SMS Notifications
- **Icon**: MessageSquare (lucide-react)

### SMS Transaction Logging
When logging SMS transactions, check notification settings:
```typescript
const { settings } = await getNotificationSettings()

if (settings?.fee_reminders) {
    await logSMSTransaction({
        recipientName: parent.name,
        recipientPhone: parent.phone,
        messageType: 'fee_reminder',
        messageContent: '...'
    })
}
```

---

## Usage Examples

### Scenario 1: Peak Billing Period
**Problem**: SMS wallet depleting rapidly during term-end billing.

**Solution**:
1. Navigate to SMS Notifications
2. Disable "Assignment Reminders" (12 SMS/student/month saved)
3. Disable "Bus Arrival/Departure" (40 SMS/student/month saved)
4. Keep "Fee Reminders" and "Payment Confirmations" active
5. **Result**: 52 SMS/student/month saved = ₦260/student saved

### Scenario 2: Safety-First School
**Problem**: Parents demand real-time attendance updates.

**Solution**:
1. Enable "Clock-In Alerts"
2. Enable "Clock-Out Alerts"
3. Enable "Absence Alerts"
4. **Result**: Parents receive instant notifications for all campus movements

### Scenario 3: Budget-Conscious Operation
**Problem**: Limited SMS budget for pilot phase.

**Solution**:
1. Disable all optional notifications
2. Keep only system-critical alerts active
3. Enable "Fee Reminders" for revenue protection
4. **Result**: Minimal SMS spend while maintaining core functionality

---

## Testing

### Manual Testing
1. **Access Settings**:
   ```
   Navigate to: /dashboard/settings/notifications
   ```

2. **Toggle Non-Critical Alert**:
   - Click toggle for "Fee Payment Reminders"
   - Verify toast notification appears
   - Refresh page and confirm state persists

3. **Attempt Critical Alert Disable**:
   - Click toggle for "Forensic Security Alerts"
   - Verify error toast appears
   - Confirm toggle remains in "ON" position

4. **Volume Calculation**:
   - Enable all notifications
   - Verify total volume updates in real-time
   - Confirm cost estimate displays correctly

### Database Testing
```sql
-- Verify default settings created for tenant
SELECT * FROM notification_settings WHERE tenant_id = '<your-tenant-id>';

-- Attempt to disable critical alert (should fail)
UPDATE notification_settings 
SET security_alerts = false 
WHERE tenant_id = '<your-tenant-id>';
-- Expected: RLS policy violation

-- Valid update
UPDATE notification_settings 
SET fee_reminders = false 
WHERE tenant_id = '<your-tenant-id>';
-- Expected: Success
```

---

## Future Enhancements

1. **Schedule-Based Toggles**: Auto-enable/disable based on academic calendar
2. **Parent Preferences**: Allow individual parents to opt-out of non-critical alerts
3. **A/B Testing**: Measure engagement rates for different notification strategies
4. **Smart Recommendations**: AI-powered suggestions based on wallet balance and engagement
5. **Bulk Actions**: Enable/disable entire categories with one click
6. **Historical Analytics**: Track which notifications drive highest parent engagement

---

## Troubleshooting

### Settings Not Loading
- **Check**: User role is admin, proprietor, or bursar
- **Verify**: RLS policies are active
- **Solution**: Run migration and verify tenant has settings record

### Toggle Not Updating
- **Check**: User role is admin or proprietor (bursars can only view)
- **Verify**: Network request completes successfully
- **Solution**: Check browser console for errors

### Critical Alert Toggle Active
- **Expected Behavior**: System-critical alerts cannot be disabled
- **Reason**: Maintains forensic audit standards and campus safety
- **Solution**: This is intentional - no action needed

### Volume Estimates Incorrect
- **Cause**: Estimates are averages and may not reflect your specific usage
- **Solution**: Monitor actual SMS transaction logs for precise data
- **Enhancement**: Future versions will use historical data for personalized estimates

---

## Migration Order

1. `notification_settings.sql` - Create table, RLS, and triggers
2. Restart application to load new server actions
3. Access `/dashboard/settings/notifications` to verify

---

**Last Updated**: 2026-02-05  
**Version**: 1.0.0  
**Status**: Production Ready
