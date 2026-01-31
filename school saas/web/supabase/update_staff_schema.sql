-- STAFF MANAGEMENT SCHEMA UPDATE
-- Run this in your Supabase SQL Editor

-- 1. Updates to Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS title text;

-- 2. Create Teacher Allocations Table
CREATE TABLE IF NOT EXISTS public.teacher_allocations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    teacher_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
    subject text NOT NULL,
    is_form_teacher boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on Teacher Allocations
ALTER TABLE public.teacher_allocations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Teacher Allocations

-- View: Admin, Registrar, and the Teacher themselves can view
DROP POLICY IF EXISTS "Teacher allocations viewable by staff" ON public.teacher_allocations;
CREATE POLICY "Teacher allocations viewable by staff" ON public.teacher_allocations
FOR SELECT USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'registrar', 'teacher')
    )
);

-- Manage: Only Admins and Registrars can manage allocations
DROP POLICY IF EXISTS "Teacher allocations manageable by admins" ON public.teacher_allocations;
CREATE POLICY "Teacher allocations manageable by admins" ON public.teacher_allocations
FOR ALL USING (
    (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) = tenant_id
    AND (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'registrar')
    )
);

-- 5. Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
