-- SIMULATE RLS
-- Run this to see what the database returns when acting AS the parent user.
-- This helps us verify if RLS is blocking access.

BEGIN;

-- 1. Switch to authenticated role (Simulating a logged-in user)
SET LOCAL role authenticated;

-- 2. Set the User ID (This is the ID linked to 'parent@school1.com' from your previous result)
SET LOCAL "request.jwt.claim.sub" = '9ecae254-e89a-40d0-8905-d5129d182f01';

-- 3. Run the query exactly as the app does
-- We try to see the students just by checking parent_id
SELECT id, full_name, parent_id, school_fees_debt 
FROM public.students 
WHERE parent_id = '9ecae254-e89a-40d0-8905-d5129d182f01';

ROLLBACK;
