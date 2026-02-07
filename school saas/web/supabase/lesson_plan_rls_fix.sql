-- RLS Fix for Lesson Plans: Allow teachers to create and edit their own plans

-- 1. Enable RLS (if not already enabled)
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies if necessary (optional - usually they are additive)
DROP POLICY IF EXISTS "Teacher can insert their own lesson plans" ON public.lesson_plans;
DROP POLICY IF EXISTS "Teacher can update their own lesson plans" ON public.lesson_plans;
DROP POLICY IF EXISTS "Teacher can delete their own lesson plans" ON public.lesson_plans;

-- 3. INSERT Policy: Allow teachers to insert plans into their own tenant
CREATE POLICY "Teacher can insert their own lesson plans" ON public.lesson_plans
FOR INSERT WITH CHECK (
    auth.uid() = teacher_id 
    AND tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- 4. UPDATE Policy: Allow teachers to update their own plans
CREATE POLICY "Teacher can update their own lesson plans" ON public.lesson_plans
FOR UPDATE USING (
    auth.uid() = teacher_id
) WITH CHECK (
    auth.uid() = teacher_id
);

-- 5. DELETE Policy: Allow teachers to delete their own plans
CREATE POLICY "Teacher can delete their own lesson plans" ON public.lesson_plans
FOR DELETE USING (
    auth.uid() = teacher_id
);

-- 6. Ensure Students can still view published plans (re-affirming the policy from previous migration)
-- The policy "Students can view published lesson plans" was added in lesson_plan_update.sql
-- And "Lesson plans viewable by tenant" was in schema.sql
