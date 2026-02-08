-- FORCE LINK AND VERIFY
-- This script updates the database and immediately shows you the connected students.

-- 1. We identify the user and update 2 random students to belong to them.
WITH target_user AS (
    SELECT id 
    FROM auth.users 
    WHERE email = 'parent@school1.com' -- <--- VERIFY THIS IS YOUR EMAIL
),
update_operation AS (
    UPDATE public.students
    SET parent_id = (SELECT id FROM target_user)
    WHERE id IN (
        SELECT id FROM public.students 
        ORDER BY created_at DESC -- Pick the newest ones just in case
        LIMIT 2
    )
    RETURNING id, full_name, parent_id
)
-- 2. We display the result. 
-- If this returns rows, the link is SUCCESSFUL.
-- If this returns empty, then either the user wasn't found or the students table is empty.
SELECT * FROM update_operation;
