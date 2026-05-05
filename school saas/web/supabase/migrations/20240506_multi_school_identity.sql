-- Migration: Support Multi-School Identity
-- This migration allows a single Auth User to have multiple profiles across different tenants.

BEGIN;

-- 1. Drop existing foreign keys that reference profiles(id)
-- We use CASCADE to handle this, but we will recreate them later.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;

-- 2. Add the new composite Primary Key
ALTER TABLE public.profiles ADD PRIMARY KEY (id, tenant_id);

-- 3. Recreate Foreign Keys with composite references
-- This ensures data integrity across tenants.

-- Students (parent_id)
ALTER TABLE public.students 
    DROP CONSTRAINT IF EXISTS students_parent_id_fkey;
ALTER TABLE public.students 
    ADD CONSTRAINT students_parent_id_fkey 
    FOREIGN KEY (parent_id, tenant_id) 
    REFERENCES public.profiles(id, tenant_id) ON DELETE SET NULL;

-- Lesson Plans (teacher_id)
ALTER TABLE public.lesson_plans 
    DROP CONSTRAINT IF EXISTS lesson_plans_teacher_id_fkey;
ALTER TABLE public.lesson_plans 
    ADD CONSTRAINT lesson_plans_teacher_id_fkey 
    FOREIGN KEY (teacher_id, tenant_id) 
    REFERENCES public.profiles(id, tenant_id) ON DELETE SET NULL;

-- Staff Attendance (staff_id)
ALTER TABLE public.staff_attendance 
    DROP CONSTRAINT IF EXISTS staff_attendance_staff_id_fkey;
ALTER TABLE public.staff_attendance 
    ADD CONSTRAINT staff_attendance_staff_id_fkey 
    FOREIGN KEY (staff_id, tenant_id) 
    REFERENCES public.profiles(id, tenant_id) ON DELETE CASCADE;

-- Hostels (warden_id)
ALTER TABLE public.hostels 
    DROP CONSTRAINT IF EXISTS hostels_warden_id_fkey;
ALTER TABLE public.hostels 
    ADD CONSTRAINT hostels_warden_id_fkey 
    FOREIGN KEY (warden_id, tenant_id) 
    REFERENCES public.profiles(id, tenant_id) ON DELETE SET NULL;

-- 4. Update RLS Policies to be tenant-aware for profiles
-- Use a security definer function to break recursion
CREATE OR REPLACE FUNCTION get_auth_tenants()
RETURNS SETOF uuid AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

DROP POLICY IF EXISTS "Profiles viewable by same tenant" ON public.profiles;
CREATE POLICY "Profiles viewable by same tenant" ON public.profiles
    FOR SELECT USING (tenant_id IN (SELECT get_auth_tenants()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

COMMIT;
