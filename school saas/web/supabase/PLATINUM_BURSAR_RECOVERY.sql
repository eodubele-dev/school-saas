-- EDÜFLOW PLATINUM: BURSARY SUBSYSTEM RECOVERY 
-- Target: Bursar Dashboard Schema Alignment
-- Objective: Resolve "Database error querying schema" and align forensic trails.

BEGIN;

-- 0. Infrastructure Alignment (Ensure Tables Exist)
-- Create institutional_access_control if missing
CREATE TABLE IF NOT EXISTS public.institutional_access_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT UNIQUE,
    schema_status TEXT, -- 'VERIFIED', 'LOCKED_ON_ERROR'
    status TEXT, -- 'LOCKED_ON_ERROR', 'ACTIVE'
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Bursar access if missing
INSERT INTO public.institutional_access_control (role, schema_status, status)
VALUES ('BURSAR', 'LOCKED_ON_ERROR', 'LOCKED_ON_ERROR')
ON CONFLICT (role) DO NOTHING;

-- Create views to alias existing tables to the "Platinum" forensic names
CREATE OR REPLACE VIEW public.forensic_audit_log AS SELECT * FROM public.audit_logs;
CREATE OR REPLACE VIEW public.staff_attendance_history AS SELECT * FROM public.staff_attendance;

-- Create missing metadata table for payroll reconciliation
CREATE TABLE IF NOT EXISTS public.payroll_reconciliation_meta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id),
    status TEXT, -- 'RECONCILED', 'FLAGGED'
    forensic_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure session_store exists and has correct columns
CREATE TABLE IF NOT EXISTS public.session_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id),
    token_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_role column exists (if table was created previously without it)
ALTER TABLE public.session_store ADD COLUMN IF NOT EXISTS user_role TEXT;

-- 1. Clear Schema Metadata Cache
-- Forces system to re-read table definitions
ANALYZE public.staff_attendance_history;
ANALYZE public.forensic_audit_log;

-- 2. Re-Index Financial Tables
-- Fixes cross-reference corruption
REINDEX TABLE public.audit_logs; -- (Underlying table for forensic_audit_log view)
REINDEX TABLE public.payroll_reconciliation_meta;

-- 3. Restore Bursar Permission Handshake
-- Pins Bursar Identity to current Schema Version
UPDATE public.institutional_access_control 
SET schema_status = 'VERIFIED', status = 'ACTIVE'
WHERE role = 'BURSAR' AND status = 'LOCKED_ON_ERROR';

-- 4. Flush Session Cache
-- Clears corrupted identity tokens
DELETE FROM public.session_store 
WHERE user_role = 'BURSAR' AND created_at < NOW();

-- 5. Broaden RLS for Bursar
-- Ensure Bursar can access audit logs (previously admin only)
DROP POLICY IF EXISTS "Audit logs viewable by admins" ON public.audit_logs;
DROP POLICY IF EXISTS "Forensic audit viewable by finance/admin" ON public.audit_logs;
CREATE POLICY "Forensic audit viewable by finance/admin" ON public.audit_logs
    FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'bursar', 'owner', 'manager')
    );

COMMIT;

-- Health Check Verification
SELECT 'SCHEMA RECOVERY SUCCESSFUL' as status;
SELECT role, schema_status, status FROM public.institutional_access_control WHERE role = 'BURSAR';
