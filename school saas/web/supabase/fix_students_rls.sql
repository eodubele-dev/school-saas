-- RLS POLICIES FIX FOR STUDENTS TABLE
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS (just in case)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Students viewable by tenant" ON public.students;
DROP POLICY IF EXISTS "Students insertable by tenant admins" ON public.students;
DROP POLICY IF EXISTS "Students updatable by tenant admins" ON public.students;
DROP POLICY IF EXISTS "Students deletable by tenant admins" ON public.students;

-- 3. Create SELECT policy
CREATE POLICY "Students viewable by tenant" ON public.students
FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- 4. Create INSERT policy (This was missing!)
CREATE POLICY "Students insertable by tenant admins" ON public.students
FOR INSERT WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
    AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. Create UPDATE policy
CREATE POLICY "Students updatable by tenant admins" ON public.students
FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
    AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 6. Create DELETE policy
CREATE POLICY "Students deletable by tenant admins" ON public.students
FOR DELETE USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()) 
    AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 7. Reload schema cache
NOTIFY pgrst, 'reload schema';
