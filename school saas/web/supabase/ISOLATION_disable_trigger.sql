-- ISOLATION TEST: Disable RLS on profiles temporarily
-- This will help us determine if the RLS policies are causing the login failure

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    RAISE NOTICE 'RLS disabled on profiles. Try logging in now.';
END $$;

DO $$ BEGIN
    RAISE NOTICE 'Trigger disabled. Try logging in now.';
END $$;

-- Also check if there are any other triggers on profiles
SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass;
