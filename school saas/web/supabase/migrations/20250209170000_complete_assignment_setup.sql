-- Create Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    class_id UUID REFERENCES public.classes(id) NOT NULL,
    subject_id UUID REFERENCES public.subjects(id), -- Nullable if general
    teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    points INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Submissions Table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) NOT NULL,
    content TEXT, -- Text answer or URL
    file_url TEXT, -- Explicit file URL if attachment
    grade NUMERIC(5,2),
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user tenant
CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS uuid AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for Assignments
DROP POLICY IF EXISTS "Assignments viewable by tenant" ON public.assignments;
CREATE POLICY "Assignments viewable by tenant" ON public.assignments
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS "Teachers can insert assignments" ON public.assignments;
CREATE POLICY "Teachers can insert assignments" ON public.assignments
    FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS "Teachers can update assignments" ON public.assignments;
CREATE POLICY "Teachers can update assignments" ON public.assignments
    FOR UPDATE USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS "Teachers can delete assignments" ON public.assignments;
CREATE POLICY "Teachers can delete assignments" ON public.assignments
    FOR DELETE USING (tenant_id = get_auth_tenant_id());

-- Policies for Submissions
DROP POLICY IF EXISTS "Submissions viewable by tenant" ON public.assignment_submissions;
CREATE POLICY "Submissions viewable by tenant" ON public.assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = assignment_id AND a.tenant_id = get_auth_tenant_id()
        )
    );

DROP POLICY IF EXISTS "Students can insert submissions" ON public.assignment_submissions;
CREATE POLICY "Students can insert submissions" ON public.assignment_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = assignment_id AND a.tenant_id = get_auth_tenant_id()
        )
    );

DROP POLICY IF EXISTS "Students update own submissions" ON public.assignment_submissions;
CREATE POLICY "Students update own submissions" ON public.assignment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = assignment_id AND a.tenant_id = get_auth_tenant_id()
        )
    );

-- Create Storage Bucket for Assignments
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignments', 'assignments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Assignment Public Access" ON storage.objects;
CREATE POLICY "Assignment Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'assignments' );

DROP POLICY IF EXISTS "Assignment Authenticated Upload" ON storage.objects;
CREATE POLICY "Assignment Authenticated Upload"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'assignments' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Assignment Owner Update" ON storage.objects;
CREATE POLICY "Assignment Owner Update"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'assignments' AND auth.uid() = owner );
