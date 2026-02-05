-- Function: get_user_schools
-- Description: Finds all schools (tenants) associated with a given email address.
-- This allows users to find which school dashboard they should log into.

CREATE OR REPLACE FUNCTION public.get_user_schools(email_input text)
RETURNS TABLE (
    tenant_name text,
    tenant_slug text,
    tenant_logo text,
    role text
) 
SECURITY DEFINER -- Run as database owner to access auth.users
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.name as tenant_name,
        t.slug as tenant_slug,
        t.logo_url as tenant_logo,
        p.role
    FROM 
        auth.users u
    JOIN 
        public.profiles p ON u.id = p.id
    JOIN 
        public.tenants t ON p.tenant_id = t.id
    WHERE 
        -- Case-insensitive match on email
        LOWER(u.email) = LOWER(email_input);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to public/anon so unauthenticated users can look up their school
GRANT EXECUTE ON FUNCTION public.get_user_schools(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_schools(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_schools(text) TO service_role;
