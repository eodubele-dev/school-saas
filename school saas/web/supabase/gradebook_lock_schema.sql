-- Add locking mechanism for Gradebook
ALTER TABLE public.student_grades
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
