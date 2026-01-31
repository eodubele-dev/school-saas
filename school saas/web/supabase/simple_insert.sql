-- FIXED INSERT SCRIPT - Deletes in correct order to avoid foreign key errors
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  v_tenant_id uuid;
  v_class_id uuid;
  v_student_id uuid;
BEGIN
  -- Get existing tenant
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  
  -- Delete old data in correct order (children first, then parents)
  DELETE FROM student_activities WHERE tenant_id = v_tenant_id;
  DELETE FROM student_progress WHERE tenant_id = v_tenant_id;
  DELETE FROM lessons WHERE tenant_id = v_tenant_id;
  DELETE FROM students WHERE tenant_id = v_tenant_id;
  DELETE FROM classes WHERE tenant_id = v_tenant_id;
  
  -- Create class
  INSERT INTO classes (tenant_id, name, grade_level)
  VALUES (v_tenant_id, 'Grade 2A', 'Grade 2')
  RETURNING id INTO v_class_id;
  
  -- Create student
  INSERT INTO students (tenant_id, full_name, class_id)
  VALUES (v_tenant_id, 'Emma Johnson', v_class_id)
  RETURNING id INTO v_student_id;
  
  -- Insert lessons
  INSERT INTO lessons (tenant_id, subject, grade_level, title, description, topics, order_index) VALUES
  (v_tenant_id, 'Math', 'Grade 2', 'Addition', 'Basic addition', ARRAY['Addition'], 1),
  (v_tenant_id, 'Math', 'Grade 2', 'Subtraction', 'Basic subtraction', ARRAY['Subtraction'], 2),
  (v_tenant_id, 'Reading', 'Grade 2', 'Vocabulary', 'Learning words', ARRAY['Vocabulary'], 1),
  (v_tenant_id, 'Reading', 'Grade 2', 'Comprehension', 'Understanding', ARRAY['Comprehension'], 2);
  
  -- Insert progress
  INSERT INTO student_progress (tenant_id, student_id, subject, grade_level, completed_lessons, total_lessons, progress_percentage, next_lesson_title) VALUES
  (v_tenant_id, v_student_id, 'Math', 'Grade 2', 1, 2, 50, 'Subtraction'),
  (v_tenant_id, v_student_id, 'Reading', 'Grade 2', 1, 2, 50, 'Comprehension');
  
  -- Insert activities
  INSERT INTO student_activities (tenant_id, student_id, subject, lesson_number, title, status, duration_minutes, completed_at) VALUES
  (v_tenant_id, v_student_id, 'Reading', 1, 'Practice', 'completed', 25, NOW()),
  (v_tenant_id, v_student_id, 'Math', 1, 'Practice', 'not_started', 0, NULL);
  
  RAISE NOTICE '✅ SUCCESS! Created student: %', v_student_id;
  RAISE NOTICE 'Student name: Emma Johnson';
  RAISE NOTICE 'Class: Grade 2A';
END $$;

-- Verify the data was inserted
SELECT 'Students' as table_name, COUNT(*) as count FROM students
UNION ALL SELECT 'Lessons', COUNT(*) FROM lessons
UNION ALL SELECT 'Progress', COUNT(*) FROM student_progress
UNION ALL SELECT 'Activities', COUNT(*) FROM student_activities;
