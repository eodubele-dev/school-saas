-- Forensic Audit Logging for Gradebook Integrity
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL, -- e.g., 'gradebook'
    entity_id UUID NOT NULL,   -- The ID of the student_grade record
    action TEXT NOT NULL,      -- e.g., 'SCORE_CHANGE', 'REMARK_CHANGE', 'LOCK', 'UNLOCK', 'REJECT'
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Index for fast lookup by entity
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.system_audit_logs(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Admins can see all logs, Teachers can see logs they created (optional/flexible)
CREATE POLICY "Admins can view all logs" 
ON public.system_audit_logs FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'owner', 'manager')
    )
);

CREATE POLICY "System/Server can insert logs"
ON public.system_audit_logs FOR INSERT
TO authenticated 
WITH CHECK (true);
