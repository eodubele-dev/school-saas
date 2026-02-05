-- SMS Skipped Log (Optional Analytics Table)
-- Tracks notifications that were skipped due to user settings
-- Helps schools measure cost savings from notification optimization

CREATE TABLE IF NOT EXISTS public.sms_skipped_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Event Details
    event_type TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    
    -- Skip Reason
    reason TEXT NOT NULL, -- 'USER_CONFIG_DISABLED', 'INSUFFICIENT_FUNDS', etc.
    
    -- Metadata
    skipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sms_skipped_tenant ON public.sms_skipped_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sms_skipped_at ON public.sms_skipped_log(skipped_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_skipped_event_type ON public.sms_skipped_log(event_type);

-- RLS Policies
ALTER TABLE public.sms_skipped_log ENABLE ROW LEVEL SECURITY;

-- Admins and Bursars can view skipped logs
CREATE POLICY "Tenant admins can view skipped SMS logs"
ON public.sms_skipped_log
FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'proprietor', 'bursar')
    )
);

-- System can insert skipped logs
CREATE POLICY "System can insert skipped SMS logs"
ON public.sms_skipped_log
FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
);

COMMENT ON TABLE public.sms_skipped_log IS 'Analytics table tracking SMS notifications that were skipped due to user configuration. Helps schools measure cost savings from notification optimization.';

-- View for monthly savings calculation
CREATE OR REPLACE VIEW sms_savings_report AS
SELECT 
    tenant_id,
    event_type,
    COUNT(*) as skipped_count,
    COUNT(*) * 5.00 as estimated_savings,
    DATE_TRUNC('month', skipped_at) as month
FROM public.sms_skipped_log
GROUP BY tenant_id, event_type, DATE_TRUNC('month', skipped_at);

COMMENT ON VIEW sms_savings_report IS 'Monthly report showing SMS cost savings from disabled notifications. Each skipped SMS = ₦5.00 saved.';
