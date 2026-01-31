-- Run this query first to get your IDs
-- Copy the results and use them in the seed.sql file

SELECT 
    'Tenant ID: ' || id::text as tenant_info,
    name as tenant_name
FROM tenants 
LIMIT 1;

SELECT 
    'Student ID: ' || id::text as student_info,
    full_name as student_name
FROM students 
LIMIT 1;
