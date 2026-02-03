-- Add Branding Fields to Tenants Table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS address text;

-- Ensure RLS allows update if not already set (typically handled by existing policies but good to verify)
-- Existing policy: "Tenants are viewable by everyone"
-- We need update policy for admins.

CREATE POLICY "Admins can update their tenant" ON public.tenants
FOR UPDATE
USING (
  id IN (
    SELECT tenant_id FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
