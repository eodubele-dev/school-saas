-- Migration: Align Schema with Platinum Requirements

-- 1. Enhance Tenants Table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'Starter',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Indexes for "Platinum" Speed
-- Index on Tenants subdomain (slug) for fast resolution
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- Index on Profiles tenant_id for fast joins
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);

-- Note: We cannot directly index auth.users.email from here (it's in a separate schema managed by Supabase),
-- but `get_user_schools` function performs the lookup via JOIN which is efficient enough for login.
-- If we needed strictly faster email lookups, we could replicate email to profiles, but that risks de-sync.
-- We stick to the standard Supabase pattern: auth.users -> profiles.

-- 3. Comment describing the "Identity Resolver" map
COMMENT ON TABLE public.profiles IS 'Maps auth.users (Identity) to public.tenants (School Partition). Acts as the UserAccounts table.';
