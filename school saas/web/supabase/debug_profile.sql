
-- Check if user exists and has a profile
SELECT 
    au.id AS auth_id,
    au.email,
    p.role,
    p.tenant_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE au.email = 'teacher@school1.com';
