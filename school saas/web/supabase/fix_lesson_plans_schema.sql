-- Add status and feedback columns to lesson_plans
ALTER TABLE public.lesson_plans 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS feedback text;

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_lesson_plans_status ON public.lesson_plans(status);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
