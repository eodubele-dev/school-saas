-- Update Classes Table
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS form_teacher_id UUID REFERENCES public.profiles(id);

-- Update Students Table for Roster Details
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS admission_number TEXT,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'inactive', 'transferred', 'graduated')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS medical_info JSONB DEFAULT '{}'::jsonb, -- e.g., { "conditions": ["Asthmatic"], "notes": "Inhaler in bag" }
ADD COLUMN IF NOT EXISTS financial_status TEXT CHECK (financial_status IN ('paid', 'partial', 'owing')) DEFAULT 'paid',
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Subject Assignments Table (for Subject Teachers)
CREATE TABLE IF NOT EXISTS public.subject_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL,
    class_id UUID REFERENCES public.classes(id) NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
    subject TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(class_id, teacher_id, subject)
);

-- Enable RLS
ALTER TABLE public.subject_assignments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Subject assignments viewable by tenant" ON public.subject_assignments
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- Index for fast lookup by teacher
CREATE INDEX IF NOT EXISTS idx_subject_assignments_teacher ON public.subject_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_form_teacher ON public.classes(form_teacher_id);
