-- Add new columns to the students table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS blood_group text,
ADD COLUMN IF NOT EXISTS genotype text,
ADD COLUMN IF NOT EXISTS house text,
ADD COLUMN IF NOT EXISTS club text,
ADD COLUMN IF NOT EXISTS admission_date date;

-- Add comments for documentation
COMMENT ON COLUMN public.students.blood_group IS 'Blood group (e.g., O+, A-)';
COMMENT ON COLUMN public.students.genotype IS 'Genotype (e.g., AA, AS)';
COMMENT ON COLUMN public.students.house IS 'Assigned School House (e.g., Blue House)';
COMMENT ON COLUMN public.students.club IS 'Assigned Club (e.g., Jet Club)';
COMMENT ON COLUMN public.students.admission_date IS 'Date of admission into the school';
