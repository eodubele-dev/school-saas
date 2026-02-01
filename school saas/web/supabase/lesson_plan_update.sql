-- Add missing fields for Lesson Architect
ALTER TABLE public.lesson_plans
ADD COLUMN IF NOT EXISTS term TEXT DEFAULT '1st',
ADD COLUMN IF NOT EXISTS week TEXT,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'; -- draft, generated, published

-- Ensure RLS allows students to view published plans (for the "Publish to Student" feature)
CREATE POLICY "Students can view published lesson plans" ON public.lesson_plans
FOR SELECT USING (
    is_published = true 
    AND class_id IN (
        SELECT class_id FROM public.students WHERE id = (
            SELECT id FROM public.students WHERE parent_id = auth.uid() OR id = auth.uid() LIMIT 1
        )
    )
);
