
SELECT 
    id, 
    title, 
    approval_status, 
    status, 
    tenant_id, 
    teacher_id, 
    class_id, 
    created_at,
    type
FROM lesson_plans 
ORDER BY created_at DESC 
LIMIT 5;
