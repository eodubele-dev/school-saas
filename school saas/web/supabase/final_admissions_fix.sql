-- FINAL FIX FOR ADMISSIONS HUB
-- Run this in your Supabase SQL Editor (https://app.supabase.com)

-- 1. Add all missing columns to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS middle_name text,
ADD COLUMN IF NOT EXISTS dob text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS blood_group text,
ADD COLUMN IF NOT EXISTS genotype text,
ADD COLUMN IF NOT EXISTS passport_url text,
ADD COLUMN IF NOT EXISTS house text,
ADD COLUMN IF NOT EXISTS admission_number text;

-- 2. Add Unique Constraint to admission_number
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_admission_number_key') THEN
        ALTER TABLE public.students ADD CONSTRAINT students_admission_number_key UNIQUE (admission_number);
    END IF;
END $$;

-- 3. Create Passport Storage Bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-passports', 'student-passports', true) 
ON CONFLICT (id) DO NOTHING;

-- 4. Set up Storage Policies
DROP POLICY IF EXISTS "Public Passports" ON storage.objects;
CREATE POLICY "Public Passports" ON storage.objects FOR SELECT 
USING (bucket_id = 'student-passports');

DROP POLICY IF EXISTS "Admin Upload Passports" ON storage.objects;
CREATE POLICY "Admin Upload Passports" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'student-passports'); 

-- 5. Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
