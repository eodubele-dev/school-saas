-- FIX: Parent Access to Students
-- The previous RLS cleanup might have removed or broken the policy allowing parents to see their children.

BEGIN;

-- 1. Ensure RLS is enabled
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 2. Drop potentially conflicting policies
DROP POLICY IF EXISTS "Parents can view their own children" ON public.students;
DROP POLICY IF EXISTS "Users can view students in their tenant" ON public.students;

-- 3. Create explicit Parent Policy (Non-recursive, based on direct ID match)
CREATE POLICY "Parents can view their own children"
ON public.students
FOR SELECT
USING (
    -- Direct link: The student's parent_id matches the current user's ID
    parent_id = auth.uid()
);

-- 4. Create general Tenant Policy (optimized)
CREATE POLICY "Users can view students in their tenant"
ON public.students
FOR SELECT
USING (
    tenant_id = public.get_auth_tenant_id()
);

COMMIT;

-- Verify
SELECT * FROM pg_policies WHERE tablename = 'students';
