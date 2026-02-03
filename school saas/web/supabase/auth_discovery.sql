-- Secure RPC to find which schools an email belongs to.
-- Used for the "Find My School" feature on the main login page.

CREATE OR REPLACE FUNCTION public.get_user_schools(email_input TEXT)
RETURNS TABLE (
    tenant_name TEXT,
    tenant_slug TEXT,
    tenant_logo TEXT,
    role TEXT
) 
SECURITY DEFINER -- Runs with privileges of creator (postgres) to access auth.users
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.name as tenant_name,
        t.slug as tenant_slug,
        t.logo_url as tenant_logo,
        p.role
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    JOIN public.tenants t ON t.id = p.tenant_id
    WHERE u.email = email_input;
END;
$$ LANGUAGE plpgsql;

-- Grant execute to anon/authenticated so the login page can call it
GRANT EXECUTE ON FUNCTION public.get_user_schools(TEXT) TO anon, authenticated, service_role;
