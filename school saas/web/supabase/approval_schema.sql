-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    action TEXT NOT NULL, -- e.g., 'approve_lesson_plan', 'reject_result_sheet'
    entity_type TEXT NOT NULL, -- 'lesson_plan', 'gradebook'
    entity_id UUID NOT NULL,
    performed_by UUID REFERENCES public.profiles(id) NOT NULL,
    details JSONB, -- Store rejection reasons or extra metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins/HODs can view logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'teacher') -- Assuming HOD is a teacher with elevated permissions or admin
            AND tenant_id = audit_logs.tenant_id
        )
    );

-- Policy: System/Serverside insertion (implicitly handled by service role or authenticated users performing actions)
CREATE POLICY "Users can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));


-- Update Lesson Plans for Approval Workflow
ALTER TABLE public.lesson_plans
ADD COLUMN IF NOT EXISTS approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected', 'draft')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Index for faster queue fetching
CREATE INDEX IF NOT EXISTS idx_lesson_plans_approval_status ON public.lesson_plans(approval_status, tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_id, entity_type);
