-- Add type column to lesson_plans
ALTER TABLE public.lesson_plans 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'lesson_plan' CHECK (type IN ('lesson_plan', 'lesson_note'));

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
