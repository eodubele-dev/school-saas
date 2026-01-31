-- Ensure columns are lowercase and reload schema
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_number text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS blood_group text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS genotype text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS house text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS passport_url text;

-- In case it was created with wrong casing via GUI
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'Admission_number') THEN
        ALTER TABLE public.students RENAME COLUMN "Admission_number" TO admission_number;
    END IF;
END $$;

-- Force reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
