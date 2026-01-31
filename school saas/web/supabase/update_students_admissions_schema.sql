-- Add missing columns for Admissions Hub
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS blood_group text,
ADD COLUMN IF NOT EXISTS genotype text,
ADD COLUMN IF NOT EXISTS house text,
ADD COLUMN IF NOT EXISTS passport_url text,
ADD COLUMN IF NOT EXISTS admission_number text UNIQUE;

-- create bucket for passports if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-passports', 'student-passports', true) 
ON CONFLICT (id) DO NOTHING;

-- Policy for passports
CREATE POLICY "Public Passports" ON storage.objects FOR SELECT 
USING (bucket_id = 'student-passports');

CREATE POLICY "Admin Upload Passports" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'student-passports'); 
-- Note: In prod, add auth checks. For now, trusting app logic/middleware.
