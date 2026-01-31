-- ============================================
-- ADD PHONE NUMBERS TO PARENT PROFILES
-- ============================================

-- Step 1: View existing parents (run this first to see who needs phone numbers)
SELECT 
    id,
    full_name,
    email,
    phone,
    role
FROM profiles
WHERE role = 'parent'
ORDER BY full_name;

-- Step 2: Add phone numbers to specific parents
-- Replace 'Parent Full Name' with actual names from Step 1
-- Replace '08012345678' with actual phone numbers

-- Example 1: Update by full name
UPDATE profiles 
SET phone = '08012345678' 
WHERE role = 'parent' 
AND full_name = 'John Doe';  -- Replace with actual parent name

-- Example 2: Update by email
UPDATE profiles 
SET phone = '08087654321' 
WHERE role = 'parent' 
AND email = 'parent@example.com';  -- Replace with actual email

-- Example 3: Update by ID (most reliable)
UPDATE profiles 
SET phone = '08098765432' 
WHERE id = 'parent-uuid-here';  -- Replace with actual UUID from Step 1

-- Step 3: Verify phone numbers were added
SELECT 
    full_name,
    email,
    phone,
    (SELECT COUNT(*) FROM students WHERE parent_id = profiles.id) as num_children
FROM profiles
WHERE role = 'parent'
ORDER BY full_name;

-- ============================================
-- BULK UPDATE (if you have multiple parents)
-- ============================================

-- Option: Update all parents without phone numbers to a test number
-- (Only use this for testing!)
UPDATE profiles 
SET phone = '08012345678'  -- Test phone number
WHERE role = 'parent' 
AND (phone IS NULL OR phone = '');

-- ============================================
-- NOTES
-- ============================================

-- Phone number formats accepted:
-- ✅ 08012345678 (will be converted to 2348012345678 by SMS service)
-- ✅ 2348012345678 (international format)
-- ✅ +2348012345678 (with plus sign)

-- Make sure to use real Nigerian phone numbers for production!
