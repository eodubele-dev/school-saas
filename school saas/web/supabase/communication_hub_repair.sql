-- MODERNIZE COMMUNICATION HUB
-- Adds missing setting toggles and implements robust RLS

BEGIN;

-- 1. Add missing columns to communication_settings
ALTER TABLE public.communication_settings 
ADD COLUMN IF NOT EXISTS badge_notifications_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS gradebook_updates_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS character_reports_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS absence_alerts_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS geofence_failure_alerts_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS system_integrity_logs_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS fee_reminders_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS transaction_receipts_enabled BOOLEAN DEFAULT TRUE;

-- 2. Modernize RLS for Communication Settings
ALTER TABLE public.communication_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view comms settings" ON public.communication_settings;
CREATE POLICY "Staff can view comms settings" ON public.communication_settings
    FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Staff can update comms settings" ON public.communication_settings;
CREATE POLICY "Staff can update comms settings" ON public.communication_settings
    FOR UPDATE USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Staff can insert comms settings" ON public.communication_settings;
CREATE POLICY "Staff can insert comms settings" ON public.communication_settings
    FOR INSERT WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- 3. Modernize RLS for Message Logs
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view message logs" ON public.message_logs;
CREATE POLICY "Staff can view message logs" ON public.message_logs
    FOR SELECT USING (tenant_id = public.get_auth_tenant_id());

DROP POLICY IF EXISTS "Staff can insert message logs" ON public.message_logs;
CREATE POLICY "Staff can insert message logs" ON public.message_logs
    FOR INSERT WITH CHECK (tenant_id = public.get_auth_tenant_id());

-- 4. Modernize RLS for Chat (Robust Tenant Isolation)
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chats" ON public.chat_channels;
CREATE POLICY "Users can view their own charts" ON public.chat_channels
    FOR SELECT USING (
        tenant_id = public.get_auth_tenant_id() AND 
        (auth.uid() = parent_id OR auth.uid() = staff_id)
    );

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their channels" ON public.chat_messages;
CREATE POLICY "Users can view messages in their channels" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_channels
            WHERE id = chat_messages.channel_id
            AND tenant_id = public.get_auth_tenant_id()
            AND (parent_id = auth.uid() OR staff_id = auth.uid())
        )
    );

COMMIT;
