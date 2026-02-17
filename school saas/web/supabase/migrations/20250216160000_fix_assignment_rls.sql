-- Fix RLS policies for assignment submissions

-- Drop existing update policy that might be ambiguous
DROP POLICY IF EXISTS "Students update own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Submissions viewable by tenant" ON public.assignment_submissions;

-- 1. View Policy (Join with assignments to check tenant)
CREATE POLICY "Submissions viewable by tenant" ON public.assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = assignment_id 
            AND a.tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        )
    );

-- 2. Student Update Policy (Can only update content/file before grading?)
-- Ideally students shouldn't change grades. 
-- For now, we restrict by student ownership.
CREATE POLICY "Students can update own submissions" ON public.assignment_submissions
    FOR UPDATE USING (
        student_id IN (
            SELECT id FROM public.students WHERE user_id = auth.uid()
        )
    );

-- 3. Teacher Update Policy (Can update grades/feedback)
CREATE POLICY "Teachers can update submissions" ON public.assignment_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = assignment_id 
            AND a.tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
        )
    );
