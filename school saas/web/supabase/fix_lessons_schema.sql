-- Add missing columns to 'lessons' table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS week integer;

-- Drop restrictive subject check constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'lessons' 
        AND constraint_name = 'lessons_subject_check'
    ) THEN
        ALTER TABLE public.lessons DROP CONSTRAINT lessons_subject_check;
    END IF;
END $$;

-- Verify RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lessons viewable by tenant" ON public.lessons;
CREATE POLICY "Lessons viewable by tenant" ON public.lessons
  FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS "Lessons insertable by tenant admins/teachers" ON public.lessons;
CREATE POLICY "Lessons insertable by tenant admins/teachers" ON public.lessons
  FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id());

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
