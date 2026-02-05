-- Notification Settings Schema
-- Stores per-tenant SMS notification preferences with monthly volume estimates

CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
    
    -- Financial & Revenue Notifications
    fee_reminders BOOLEAN NOT NULL DEFAULT true,
    payment_confirmations BOOLEAN NOT NULL DEFAULT true,
    outstanding_balance_alerts BOOLEAN NOT NULL DEFAULT true,
    
    -- Safety & Attendance
    attendance_clock_in BOOLEAN NOT NULL DEFAULT true,
    attendance_clock_out BOOLEAN NOT NULL DEFAULT true,
    absence_alerts BOOLEAN NOT NULL DEFAULT true,
    
    -- Academic Notifications
    result_published BOOLEAN NOT NULL DEFAULT true,
    grade_updates BOOLEAN NOT NULL DEFAULT false,
    assignment_reminders BOOLEAN NOT NULL DEFAULT false,
    
    -- Logistics & Operations
    bus_arrival_alerts BOOLEAN NOT NULL DEFAULT false,
    bus_departure_alerts BOOLEAN NOT NULL DEFAULT false,
    maintenance_updates BOOLEAN NOT NULL DEFAULT false,
    
    -- System Critical (Cannot be disabled)
    security_alerts BOOLEAN NOT NULL DEFAULT true, -- Emergency lockdowns, unauthorized access
    forensic_grade_changes BOOLEAN NOT NULL DEFAULT true, -- Grade modification alerts
    
    -- Metadata
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notification_settings_tenant ON public.notification_settings(tenant_id);

-- RLS Policies
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Admins and Bursars can view their tenant's settings
CREATE POLICY "Tenant admins can view notification settings"
ON public.notification_settings
FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'proprietor', 'bursar')
    )
);

-- Admins can update settings
CREATE POLICY "Tenant admins can update notification settings"
ON public.notification_settings
FOR UPDATE
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'proprietor')
    )
)
WITH CHECK (
    -- Prevent disabling critical alerts
    security_alerts = true AND forensic_grade_changes = true
);

-- Admins can insert initial settings
CREATE POLICY "Tenant admins can insert notification settings"
ON public.notification_settings
FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
    AND security_alerts = true 
    AND forensic_grade_changes = true
);

-- Function to create default settings for new tenants
CREATE OR REPLACE FUNCTION create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notification_settings (tenant_id)
    VALUES (NEW.id)
    ON CONFLICT (tenant_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create settings for new tenants
DROP TRIGGER IF EXISTS trigger_create_notification_settings ON public.tenants;
CREATE TRIGGER trigger_create_notification_settings
    AFTER INSERT ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION create_default_notification_settings();

COMMENT ON TABLE public.notification_settings IS 'Per-tenant SMS notification preferences with system-critical alerts that cannot be disabled. Helps manage SMS wallet spending while maintaining forensic audit standards.';
