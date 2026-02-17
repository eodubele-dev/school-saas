
-- FIX: Add missing status and total_questions columns to cbt_attempts safely
DO $$ 
BEGIN
    -- Add status column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cbt_attempts' AND column_name = 'status') THEN
        ALTER TABLE public.cbt_attempts ADD COLUMN status text NOT NULL DEFAULT 'in_progress';
    END IF;

    -- Add total_questions column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cbt_attempts' AND column_name = 'total_questions') THEN
        ALTER TABLE public.cbt_attempts ADD COLUMN total_questions integer DEFAULT 0;
    END IF;
END $$;
