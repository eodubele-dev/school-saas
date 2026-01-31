-- Complete Setup Script for School SaaS Dashboard
-- This creates a tenant, class, student, parent profile, and seeds lesson data
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- STEP 1: Create a Tenant (School)
-- ============================================
INSERT INTO public.tenants (name, slug, domain)
VALUES ('Demo School', 'demo-school', 'demo-school.localhost')
RETURNING id, name;

-- Get the tenant_id we just created (you'll see this in the output)
-- We'll use a variable approach for the rest

-- ============================================
-- STEP 2: Create Everything Else
-- ============================================
DO $$
DECLARE
  v_tenant_id uuid;
  v_class_id uuid;
  v_student_id uuid;
  v_parent_id uuid;
BEGIN
  -- Get the tenant we just created
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'demo-school';
  
  RAISE NOTICE 'Using Tenant ID: %', v_tenant_id;

  -- Create a class
  INSERT INTO public.classes (tenant_id, name, grade_level)
  VALUES (v_tenant_id, 'Grade 2A', 'Grade 2')
  RETURNING id INTO v_class_id;
  
  RAISE NOTICE 'Created Class ID: %', v_class_id;

  -- Note: For the parent profile, you'll need to create a user in Supabase Auth first
  -- For now, we'll create a student without a parent link
  -- You can update the parent_id later after creating a parent user

  -- Create a student
  INSERT INTO public.students (tenant_id, full_name, class_id, parent_id)
  VALUES (v_tenant_id, 'Emma Johnson', v_class_id, NULL)
  RETURNING id INTO v_student_id;
  
  RAISE NOTICE 'Created Student ID: %', v_student_id;

  -- ============================================
  -- Insert Math Lessons (Grade 2)
  -- ============================================
  INSERT INTO public.lessons (tenant_id, subject, grade_level, title, description, topics, order_index)
  VALUES
    (v_tenant_id, 'Math', 'Grade 2', 'Addition & Subtraction', 'Basic addition and subtraction with 2-digit numbers', ARRAY['Addition', 'Subtraction', 'Number Sense'], 1),
    (v_tenant_id, 'Math', 'Grade 2', 'Place Value Understanding', 'Understanding ones, tens, and hundreds place', ARRAY['Place Value', 'Number Sense'], 2),
    (v_tenant_id, 'Math', 'Grade 2', 'Word Problem Solving', 'Solving simple word problems with addition/subtraction', ARRAY['Word Problems', 'Critical Thinking'], 3),
    (v_tenant_id, 'Math', 'Grade 2', '2-Digit Subtraction', 'Subtraction with borrowing', ARRAY['Subtraction', 'Borrowing'], 4),
    (v_tenant_id, 'Math', 'Grade 2', 'Skip Counting', 'Counting by 2s, 5s, and 10s', ARRAY['Skip Counting', 'Patterns'], 5),
    (v_tenant_id, 'Math', 'Grade 2', 'Introduction to Multiplication', 'Basic multiplication concepts', ARRAY['Multiplication', 'Arrays'], 6),
    (v_tenant_id, 'Math', 'Grade 2', 'Measurement Basics', 'Measuring length and weight', ARRAY['Measurement', 'Units'], 7),
    (v_tenant_id, 'Math', 'Grade 2', 'Shapes and Geometry', 'Identifying 2D and 3D shapes', ARRAY['Geometry', 'Shapes'], 8);

  -- ============================================
  -- Insert Reading Lessons (Grade 2)
  -- ============================================
  INSERT INTO public.lessons (tenant_id, subject, grade_level, title, description, topics, order_index)
  VALUES
    (v_tenant_id, 'Reading', 'Grade 2', 'Vocabulary Building', 'Learning new words and their meanings', ARRAY['Vocabulary', 'Word Recognition'], 1),
    (v_tenant_id, 'Reading', 'Grade 2', 'Reading Comprehension', 'Understanding what you read', ARRAY['Comprehension', 'Main Idea'], 2),
    (v_tenant_id, 'Reading', 'Grade 2', 'Story Retelling', 'Retelling stories in your own words', ARRAY['Retelling', 'Sequencing'], 3),
    (v_tenant_id, 'Reading', 'Grade 2', 'Long & Short Vowels', 'Identifying vowel sounds', ARRAY['Phonics', 'Vowels'], 4),
    (v_tenant_id, 'Reading', 'Grade 2', 'Sight Words Mastery', 'Recognizing common sight words', ARRAY['Sight Words', 'Fluency'], 5),
    (v_tenant_id, 'Reading', 'Grade 2', 'Character Analysis', 'Understanding characters in stories', ARRAY['Characters', 'Analysis'], 6),
    (v_tenant_id, 'Reading', 'Grade 2', 'Making Predictions', 'Predicting what happens next', ARRAY['Predictions', 'Inference'], 7),
    (v_tenant_id, 'Reading', 'Grade 2', 'Comparing Stories', 'Finding similarities and differences', ARRAY['Compare', 'Contrast'], 8);

  -- ============================================
  -- Insert Student Progress Records
  -- ============================================
  INSERT INTO public.student_progress (tenant_id, student_id, subject, grade_level, completed_lessons, total_lessons, progress_percentage, next_lesson_title)
  VALUES
    (v_tenant_id, v_student_id, 'Math', 'Grade 2', 6, 8, 75, '2-Digit Subtraction'),
    (v_tenant_id, v_student_id, 'Reading', 'Grade 2', 3, 8, 38, 'Long & Short Vowels');

  -- ============================================
  -- Insert Today's Activities
  -- ============================================
  INSERT INTO public.student_activities (tenant_id, student_id, lesson_id, subject, lesson_number, title, status, duration_minutes, completed_at)
  VALUES
    (v_tenant_id, v_student_id, NULL, 'Reading', 1, 'Practice Exercises', 'completed', 25, NOW() - INTERVAL '3 hours'),
    (v_tenant_id, v_student_id, NULL, 'Reading', 2, 'Practice Exercises', 'completed', 30, NOW() - INTERVAL '2 hours'),
    (v_tenant_id, v_student_id, NULL, 'Math', 3, 'Practice Exercises', 'not_started', 0, NULL),
    (v_tenant_id, v_student_id, NULL, 'Math', 4, 'Practice Exercises', 'not_started', 0, NULL);

  -- ============================================
  -- Summary
  -- ============================================
  RAISE NOTICE '✅ Setup Complete!';
  RAISE NOTICE 'Tenant ID: %', v_tenant_id;
  RAISE NOTICE 'Student ID: %', v_student_id;
  RAISE NOTICE 'Class ID: %', v_class_id;
  
END $$;

-- ============================================
-- Verify the data
-- ============================================
SELECT 'Tenants' as table_name, COUNT(*)::text as count FROM tenants
UNION ALL
SELECT 'Classes', COUNT(*)::text FROM classes
UNION ALL
SELECT 'Students', COUNT(*)::text FROM students
UNION ALL
SELECT 'Lessons', COUNT(*)::text FROM lessons
UNION ALL
SELECT 'Student Progress', COUNT(*)::text FROM student_progress
UNION ALL
SELECT 'Student Activities', COUNT(*)::text FROM student_activities;

-- Show the created records
SELECT 'Created Tenant:' as info, name, slug FROM tenants WHERE slug = 'demo-school'
UNION ALL
SELECT 'Created Student:', full_name, NULL FROM students WHERE full_name = 'Emma Johnson';
