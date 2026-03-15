-- Add missing bio fields to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text;

-- Optional: Add check constraint for gender
ALTER TABLE public.students 
DROP CONSTRAINT IF EXISTS students_gender_check;

ALTER TABLE public.students
ADD CONSTRAINT students_gender_check 
CHECK (gender IN ('Male', 'Female', 'Other', 'Rather not say'));

COMMENT ON COLUMN public.students.date_of_birth IS 'Student date of birth';
COMMENT ON COLUMN public.students.gender IS 'Student gender';
