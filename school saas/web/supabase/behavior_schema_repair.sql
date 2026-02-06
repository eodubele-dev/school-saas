-- REPAIR: Behavioral Reports Schema Mismatch
-- This script ensures all required columns and constraints exist for the Termly Ratings feature.

DO $$ 
BEGIN
    -- 1. Add missing Affective Domain columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'behavioral_reports' AND column_name = 'honesty') THEN
        ALTER TABLE public.behavioral_reports ADD COLUMN honesty INTEGER CHECK (honesty BETWEEN 1 AND 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'behavioral_reports' AND column_name = 'leadership') THEN
        ALTER TABLE public.behavioral_reports ADD COLUMN leadership INTEGER CHECK (leadership BETWEEN 1 AND 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'behavioral_reports' AND column_name = 'attentiveness') THEN
        ALTER TABLE public.behavioral_reports ADD COLUMN attentiveness INTEGER CHECK (attentiveness BETWEEN 1 AND 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'behavioral_reports' AND column_name = 'peer_relations') THEN
        ALTER TABLE public.behavioral_reports ADD COLUMN peer_relations INTEGER CHECK (peer_relations BETWEEN 1 AND 5);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'behavioral_reports' AND column_name = 'overall_remark') THEN
        ALTER TABLE public.behavioral_reports ADD COLUMN overall_remark TEXT;
    END IF;

    -- 2. Ensure the Unique Constraint exists for the Upsert operation
    -- First, check if a similar unique constraint already exists to avoid duplication
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc 
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name 
        WHERE tc.table_name = 'behavioral_reports' AND tc.constraint_type = 'UNIQUE'
        AND ccu.column_name IN ('student_id', 'term', 'session')
        GROUP BY tc.constraint_name
        HAVING COUNT(*) = 3
    ) THEN
        ALTER TABLE public.behavioral_reports ADD CONSTRAINT behavioral_reports_student_id_term_session_key UNIQUE (student_id, term, session);
    END IF;

END $$;
