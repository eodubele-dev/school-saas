-- SMS Transaction Log
-- Immutable forensic audit trail for all institutional communications

CREATE TABLE IF NOT EXISTS public.sms_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Message Details
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'fee_reminder', 'attendance_alert', 'result_notification', etc.
    message_content TEXT,
    
    -- Delivery Tracking
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'delivered', 'failed'
    delivery_time TIMESTAMPTZ,
    failure_reason TEXT,
    
    -- Financial Tracking
    cost DECIMAL(10, 2) NOT NULL DEFAULT 5.00, -- Cost per SMS unit
    
    -- Audit Trail
    sent_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sms_transactions_tenant ON public.sms_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sms_transactions_sent_at ON public.sms_transactions(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_transactions_status ON public.sms_transactions(status);

-- RLS Policies
ALTER TABLE public.sms_transactions ENABLE ROW LEVEL SECURITY;

-- Admins and Bursars can view their tenant's SMS logs
CREATE POLICY "Tenant admins and bursars can view SMS logs"
ON public.sms_transactions
FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'proprietor', 'bursar')
    )
);

-- Only system can insert (via server actions)
CREATE POLICY "System can insert SMS transactions"
ON public.sms_transactions
FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
);

-- Immutable: No updates or deletes allowed (forensic integrity)
-- No UPDATE or DELETE policies = no one can modify or delete

COMMENT ON TABLE public.sms_transactions IS 'Immutable forensic audit trail for all institutional SMS communications. Ensures transparency and accountability for communication spending.';
