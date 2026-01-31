-- DIAGNOSTIC: Check RLS policies and insert data with detailed error checking
-- Run this in Supabase SQL Editor

-- Step 1: Check if RLS is blocking inserts
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('students', 'lessons', 'student_progress', 'student_activities')
ORDER BY tablename, policyname;

-- Step 2: Try inserting with RLS DISABLED (as superuser)
-- This will work in Supabase SQL Editor because it runs as postgres role

DO $$
DECLARE
  v_tenant_id uuid;
  v_class_id uuid;
  v_student_id uuid;
  v_lesson_count int;
BEGIN
  -- Get tenant
  SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
  RAISE NOTICE 'Tenant ID: %', v_tenant_id;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant found!';
  END IF;

  -- Create class
  BEGIN
    INSERT INTO public.classes (tenant_id, name, grade_level)
    VALUES (v_tenant_id, 'Grade 2A', 'Grade 2')
    RETURNING id INTO v_class_id;
    RAISE NOTICE 'Created class: %', v_class_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Class insert error: %', SQLERRM;
  END;

  -- Create student
  BEGIN
    INSERT INTO public.students (tenant_id, full_name, class_id)
    VALUES (v_tenant_id, 'Emma Johnson', v_class_id)
    RETURNING id INTO v_student_id;
    RAISE NOTICE 'Created student: %', v_student_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Student insert error: %', SQLERRM;
  END;

  -- Insert lessons
  BEGIN
    INSERT INTO public.lessons (tenant_id, subject, grade_level, title, description, topics, order_index)
    VALUES
      (v_tenant_id, 'Math', 'Grade 2', 'Addition', 'Basic addition', ARRAY['Addition'], 1),
      (v_tenant_id, 'Math', 'Grade 2', 'Subtraction', 'Basic subtraction', ARRAY['Subtraction'], 2),
      (v_tenant_id, 'Reading', 'Grade 2', 'Vocabulary', 'Learning words', ARRAY['Vocabulary'], 1),
      (v_tenant_id, 'Reading', 'Grade 2', 'Comprehension', 'Understanding text', ARRAY['Comprehension'], 2);
    
    SELECT COUNT(*) INTO v_lesson_count FROM public.lessons WHERE tenant_id = v_tenant_id;
    RAISE NOTICE 'Inserted % lessons', v_lesson_count;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Lessons insert error: %', SQLERRM;
  END;

  -- Insert progress
  BEGIN
    INSERT INTO public.student_progress (tenant_id, student_id, subject, grade_level, completed_lessons, total_lessons, progress_percentage, next_lesson_title)
    VALUES
      (v_tenant_id, v_student_id, 'Math', 'Grade 2', 1, 2, 50, 'Subtraction'),
      (v_tenant_id, v_student_id, 'Reading', 'Grade 2', 1, 2, 50, 'Comprehension');
    RAISE NOTICE 'Inserted progress records';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Progress insert error: %', SQLERRM;
  END;

  -- Insert activities
  BEGIN
    INSERT INTO public.student_activities (tenant_id, student_id, subject, lesson_number, title, status, duration_minutes)
    VALUES
      (v_tenant_id, v_student_id, 'Reading', 1, 'Practice', 'completed', 25),
      (v_tenant_id, v_student_id, 'Math', 1, 'Practice', 'not_started', 0);
    RAISE NOTICE 'Inserted activity records';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Activities insert error: %', SQLERRM;
  END;

END $$;

-- Step 3: Verify what was actually inserted
SELECT 'Students' as table_name, COUNT(*)::text as count FROM students
UNION ALL
SELECT 'Lessons', COUNT(*)::text FROM lessons
UNION ALL
SELECT 'Progress', COUNT(*)::text FROM student_progress
UNION ALL
SELECT 'Activities', COUNT(*)::text FROM student_activities;
