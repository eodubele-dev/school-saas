-- 1. Update Students Table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS passport_url TEXT,
ADD COLUMN IF NOT EXISTS admission_number TEXT,
ADD COLUMN IF NOT EXISTS house TEXT;

-- Ensure admission_number is unique per tenant (optional but good practice)
-- We use a partial index or composite unique constraint if needed, 
-- but for now let's just add the column. 
-- Adding a constraint might fail if existing data has duplicates/nulls, so we skip strictly enforcing unique for now.

-- 2. Student Attendance Table
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    student_id UUID REFERENCES public.students(id) NOT NULL,
    class_id UUID REFERENCES public.classes(id) NOT NULL,
    date DATE NOT NULL,
    status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, date)
);

-- 3. Student Report Cards (Affective Domain & Remarks)
CREATE TABLE IF NOT EXISTS public.student_report_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    student_id UUID REFERENCES public.students(id) NOT NULL,
    class_id UUID REFERENCES public.classes(id) NOT NULL,
    term TEXT NOT NULL, -- '1st', '2nd', '3rd'
    session TEXT NOT NULL, -- '2023/2024'
    affective_domain JSONB DEFAULT '{}'::jsonb, -- e.g. {"neatness": 5, "punctuality": 4}
    teacher_remark TEXT,
    principal_remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, term, session)
);

-- Enable RLS
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_report_cards ENABLE ROW LEVEL SECURITY;

-- Policies for Attendance

-- View: Tenant members
CREATE POLICY "Attendance viewable by tenant" ON public.student_attendance
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

-- Manage: Teachers (tenant members)
CREATE POLICY "Teachers can manage attendance" ON public.student_attendance
    FOR ALL USING (tenant_id = get_auth_tenant_id());


-- Policies for Report Cards

-- View: Tenant members
CREATE POLICY "Report cards viewable by tenant" ON public.student_report_cards
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

-- Manage: Teachers (tenant members)
CREATE POLICY "Teachers can manage report cards" ON public.student_report_cards
    FOR ALL USING (tenant_id = get_auth_tenant_id());


DO $$
BEGIN
  RAISE NOTICE '✅ Result Processor Schema Applied (Students Updated, Attendance & Reports Created)';
END $$;
