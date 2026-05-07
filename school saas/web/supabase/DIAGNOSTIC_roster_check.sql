
-- Diagnostic script for Student Roster
SELECT 
    c.id as class_id, 
    c.name as class_name, 
    c.form_teacher_id,
    p.full_name as teacher_name,
    COUNT(s.id) as student_count
FROM public.classes c
LEFT JOIN public.profiles p ON c.form_teacher_id = p.id
LEFT JOIN public.students s ON c.id = s.class_id
GROUP BY c.id, c.name, c.form_teacher_id, p.full_name;

-- Check students in the class directly
SELECT id, full_name, class_id, tenant_id FROM public.students LIMIT 10;
