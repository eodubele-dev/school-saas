-- ACADEMIC SETUP SCHEMA UPDATE

-- 1. Academic Sessions Table
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    session text NOT NULL, -- e.g., '2025/2026'
    term text NOT NULL, -- e.g., 'First Term'
    is_active boolean DEFAULT false,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, session, term)
);

-- 2. Grade Scales Table
CREATE TABLE IF NOT EXISTS public.grade_scales (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    grade text NOT NULL, -- e.g., 'A1'
    min_score integer NOT NULL,
    max_score integer NOT NULL,
    remark text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Class Subjects Mapping Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.class_subjects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(tenant_id, class_id, subject_id)
);

-- 4. Enable RLS
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Sessions: Viewable by everyone in tenant, Manageable by Admin
CREATE POLICY "Sessions viewable by tenant" ON public.academic_sessions
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Sessions manageable by admin" ON public.academic_sessions
FOR ALL USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Grade Scales: Same as above
CREATE POLICY "Grade scales viewable by tenant" ON public.grade_scales
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Grade scales manageable by admin" ON public.grade_scales
FOR ALL USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Class Subjects: Same as above
CREATE POLICY "Class subjects viewable by tenant" ON public.class_subjects
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Class subjects manageable by admin" ON public.class_subjects
FOR ALL USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 6. CA Weighting Config (Adding to Tenants table via JSON config if simpler, but let's assume separate config table or just columns in tenant theme/config. 
-- For now, let's add a 'settings' jsonb column to tenants if it doesn't exist, or use 'theme_config' if unrelated. 
-- Better: Add 'academic_config' column to tenants)

ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS academic_config jsonb DEFAULT '{"ca_weight": 40, "exam_weight": 60}'::jsonb;

-- Force Schema Refresh
NOTIFY pgrst, 'reload schema';
