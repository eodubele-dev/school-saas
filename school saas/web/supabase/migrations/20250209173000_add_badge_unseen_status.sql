-- Add user_id to students table to link to auth.users
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add email to students table for easier linking (optional but good for semantic match)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add unseen status to achievements
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS is_unseen BOOLEAN DEFAULT TRUE;

-- Allow students to update their own achievements (to mark as seen)
DROP POLICY IF EXISTS "Students can update own achievements" ON public.achievements;
CREATE POLICY "Students can update own achievements" ON public.achievements
    FOR UPDATE
    USING (student_id IN (
        SELECT id FROM public.students 
        WHERE user_id = auth.uid() 
           OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ))
    WITH CHECK (student_id IN (
        SELECT id FROM public.students 
        WHERE user_id = auth.uid() 
           OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ));

