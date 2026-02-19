-- Add remaining approval columns to lesson_plans
ALTER TABLE public.lesson_plans 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Refresh the schema cache (optional but good practice)
NOTIFY pgrst, 'reload config';
