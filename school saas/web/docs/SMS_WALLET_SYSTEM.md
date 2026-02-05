# SMS Wallet & Transaction System

## Overview
The SMS Wallet system provides **forensic-grade accountability** for all institutional communications in EduFlow Platinum. Every message sent is tracked, logged, and made immutable to ensure complete transparency for financial reconciliation and dispute resolution.

---

## Architecture

### 1. **SMS Wallet Balance**
- Stored in `tenants.sms_balance` (DECIMAL)
- Initialized during onboarding (Lagos Pilot: ₦10,000 minimum)
- Real-time deduction via database trigger
- Visible in Admin & Bursar dashboards

### 2. **Transaction Logging**
- **Table**: `sms_transactions`
- **Immutability**: No UPDATE or DELETE policies
- **Auto-Deduction**: Trigger automatically deducts cost from wallet
- **Forensic Audit**: Complete message history with delivery status

### 3. **Alert System**
- **Low Balance Alert** (< ₦2,000): Amber warning banner
- **Critical Alert** (₦0): Red banner + soft-lock on communication features
- **Revenue Recovery Hub**: Locks when balance is empty

---

## Database Schema

```sql
CREATE TABLE public.sms_transactions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    message_type TEXT NOT NULL,
    message_content TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    delivery_time TIMESTAMPTZ,
    failure_reason TEXT,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    sent_by UUID,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);
```

### Indexes
- `idx_sms_transactions_tenant` - Fast tenant filtering
- `idx_sms_transactions_sent_at` - Chronological queries
- `idx_sms_transactions_status` - Delivery status filtering

---

## Server Actions

### `getSMSTransactions(limit: number)`
Fetches SMS transaction history for forensic audit.

**Access**: Admin, Proprietor, Bursar only

**Returns**:
```typescript
{
    success: boolean
    transactions: Array<{
        id: string
        parentName: string
        phone: string
        type: string
        status: 'Delivered' | 'Pending' | 'Failed'
        cost: number
        timestamp: string
    }>
}
```

### `logSMSTransaction(data)`
Records a new SMS send attempt with balance validation.

**Parameters**:
```typescript
{
    recipientName: string
    recipientPhone: string
    messageType: string
    messageContent?: string
    cost?: number
}
```

**Returns**:
```typescript
{
    success: boolean
    cost?: number
    newBalance?: number
    error?: string
    balanceRequired?: number
    currentBalance?: number
}
```

---

## UI Components

### 1. **SMSWalletAlert**
High-visibility banner for low/critical balance warnings.

**Props**:
- `balance: number` - Current SMS wallet balance
- `onTopUp?: () => void` - Optional top-up handler

**States**:
- **Normal** (≥ ₦2,000): No alert
- **Low** (< ₦2,000): Amber banner
- **Critical** (₦0): Red banner with pulse animation

### 2. **SMSTransactionWidget**
Forensic ledger displaying line-by-line SMS accountability.

**Props**:
- `transactions: SMSTransaction[]` - Array of SMS transactions

**Features**:
- Sortable table with delivery status
- Cost tracking per message
- 24-hour total calculation
- Export to CSV (UI ready)
- Custom scrollbar for data-heavy views

---

## Integration Points

### Admin Dashboard
- SMS balance display in Pilot Mode card
- Revenue Recovery Hub soft-locks when balance is ₦0
- High-visibility "Lagos Pilot Mode" badge

### Bursar Dashboard
- SMS wallet status indicator in header
- Full SMS Transaction Widget below revenue charts
- Real-time balance updates

---

## Triggers & Automation

### `deduct_sms_wallet()`
Automatically deducts SMS cost from tenant wallet when a transaction is logged.

**Behavior**:
1. Fires AFTER INSERT on `sms_transactions`
2. Deducts `cost` from `tenants.sms_balance`
3. Raises exception if balance would go negative
4. Ensures real-time balance accuracy

---

## Security & RLS

### View Access
- **Admin/Proprietor/Bursar**: Can view all tenant SMS logs
- **Other roles**: No access

### Insert Access
- **All authenticated users**: Can log SMS (with balance validation)
- **System validation**: Prevents overdraft via trigger

### Immutability
- **No UPDATE policy**: Records cannot be modified
- **No DELETE policy**: Records cannot be deleted
- **Forensic integrity**: Complete audit trail preserved

---

## Testing

### Seed Data
Run `supabase/seed_sms_transactions.sql` to populate test data:
- 30 sample transactions
- Realistic Nigerian parent names
- Mixed delivery statuses
- Chronological distribution over 30 hours

### Manual Testing
1. **Low Balance Alert**:
   ```sql
   UPDATE tenants SET sms_balance = 1500 WHERE id = '<your-tenant-id>';
   ```

2. **Critical Alert**:
   ```sql
   UPDATE tenants SET sms_balance = 0 WHERE id = '<your-tenant-id>';
   ```

3. **Log Transaction**:
   ```typescript
   await logSMSTransaction({
       recipientName: 'Mrs. Test Parent',
       recipientPhone: '08012345678',
       messageType: 'fee_reminder',
       messageContent: 'Test message'
   })
   ```

---

## Cost Structure

| Message Type | Cost per SMS |
|-------------|--------------|
| Standard SMS | ₦5.00 |
| Long SMS (>160 chars) | ₦10.00 |
| International | ₦15.00 |

**Note**: Costs are configurable per transaction via the `cost` parameter.

---

## Future Enhancements

1. **Gateway Integration**: Connect to Termii/AfricasTalking for actual SMS delivery
2. **Delivery Webhooks**: Update status from 'pending' to 'delivered'/'failed' via webhooks
3. **Bulk SMS**: Batch processing for class-wide or school-wide announcements
4. **SMS Templates**: Pre-defined message templates for common scenarios
5. **Analytics Dashboard**: SMS usage patterns, peak times, delivery rates
6. **Auto Top-Up**: Automatic wallet recharge when balance falls below threshold

---

## Troubleshooting

### Balance Not Updating
- Check if `sms_wallet_trigger.sql` migration has been applied
- Verify trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_deduct_sms_wallet';`

### Transactions Not Showing
- Verify RLS policies are active
- Check user role is 'admin', 'proprietor', or 'bursar'
- Ensure `tenant_id` matches between user profile and transactions

### Overdraft Error
- This is expected behavior - validates balance before logging
- Top up wallet or reduce message frequency
- Check for concurrent transaction race conditions

---

## Migration Order

1. `sms_transaction_log.sql` - Create table and RLS
2. `sms_wallet_trigger.sql` - Auto-deduction trigger
3. `seed_sms_transactions.sql` - Test data (optional)

---

**Last Updated**: 2026-02-05  
**Version**: 1.0.0  
**Status**: Production Ready
