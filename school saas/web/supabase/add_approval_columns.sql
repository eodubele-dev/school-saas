-- Add approval_status column to lesson_plans
ALTER TABLE public.lesson_plans 
ADD COLUMN IF NOT EXISTS approval_status TEXT CHECK (approval_status IN ('draft', 'pending', 'approved', 'rejected')) DEFAULT 'draft';

-- Migrate existing data from 'status' to 'approval_status'
-- 'submitted' -> 'pending'
UPDATE public.lesson_plans 
SET approval_status = 'pending' 
WHERE status = 'submitted';

-- 'approved' -> 'approved'
UPDATE public.lesson_plans 
SET approval_status = 'approved' 
WHERE status = 'approved';

-- 'rejected' -> 'rejected'
UPDATE public.lesson_plans 
SET approval_status = 'rejected' 
WHERE status = 'rejected';

-- 'draft' -> 'draft'
UPDATE public.lesson_plans 
SET approval_status = 'draft' 
WHERE status = 'draft';

-- Ensure manual published notes are approved
UPDATE public.lesson_plans
SET approval_status = 'approved'
WHERE type = 'lesson_note' AND is_published = true AND approval_status = 'draft';
