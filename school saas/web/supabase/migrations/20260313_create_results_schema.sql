-- Migration: Create Term Results Schema

CREATE TABLE IF NOT EXISTS public.term_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    term TEXT NOT NULL CHECK (term IN ('1st', '2nd', '3rd')),
    session_id TEXT NOT NULL,
    affective_domain JSONB DEFAULT '{}'::jsonB,
    teacher_remark TEXT,
    principal_remark TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted_for_review', 'approved_by_principal', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, student_id, term, session_id)
);

-- Enable RLS
ALTER TABLE public.term_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view results in their own tenant
CREATE POLICY "Users can view term_results in their tenant"
    ON public.term_results FOR SELECT
    USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Policy: Staff can insert/update results in their own tenant
CREATE POLICY "Staff can insert and update term_results"
    ON public.term_results FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        AND EXISTS (
             SELECT 1 FROM public.staff_permissions WHERE staff_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_term_results_tenant_id ON public.term_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_term_results_student_id ON public.term_results(student_id);
CREATE INDEX IF NOT EXISTS idx_term_results_class_id ON public.term_results(class_id);

-- Comment
COMMENT ON TABLE public.term_results IS 'Stores end-of-term results including behavioral assessments (affective domain) and teacher/principal remarks.';
