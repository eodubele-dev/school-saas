
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
-- DROP to ensure no errors if it exists (re-creation)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policy: Service role has full access (often needed for seeding scripts)
DROP POLICY IF EXISTS "Service role full access" ON profiles;

CREATE POLICY "Service role full access" 
ON profiles FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies applied to profiles table.';
END $$;
