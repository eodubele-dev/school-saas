
-- FIX: Add missing status column to cbt_attempts safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cbt_attempts' AND column_name = 'status') THEN
        ALTER TABLE public.cbt_attempts ADD COLUMN status text NOT NULL DEFAULT 'in_progress';
    END IF;
END $$;
