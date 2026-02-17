
-- Add status column to cbt_attempts if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cbt_attempts' AND column_name = 'status') THEN
        ALTER TABLE public.cbt_attempts ADD COLUMN status text NOT NULL DEFAULT 'in_progress';
    END IF;
END $$;

-- Add started_at if missing (just in case)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cbt_attempts' AND column_name = 'started_at') THEN
        ALTER TABLE public.cbt_attempts ADD COLUMN started_at timestamp with time zone DEFAULT now();
    END IF;
END $$;
