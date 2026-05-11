-- 1. Create the secure RPC to get a user ID by email
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email TEXT)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
    found_id UUID;
BEGIN
    SELECT id INTO found_id FROM auth.users WHERE email = user_email LIMIT 1;
    RETURN found_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Grant execution
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO service_role, authenticated;
