-- Check for any attendance registers created today
SELECT 
    ar.id as register_id, 
    ar.date, 
    ar.class_id, 
    c.name as class_name,
    p.full_name as teacher_name
FROM attendance_registers ar
JOIN classes c ON ar.class_id = c.id
JOIN profiles p ON c.form_teacher_id = p.id
WHERE ar.date = CURRENT_DATE;

-- Check for student attendance records for today
SELECT 
    sa.id, 
    sa.status, 
    sa.student_id, 
    ar.date as register_date
FROM student_attendance sa
JOIN attendance_registers ar ON sa.register_id = ar.id
WHERE ar.date = CURRENT_DATE;
