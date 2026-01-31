-- Seed Data for Student Progress Dashboard
-- This creates sample lessons, progress, and activities for testing

-- Note: Replace the UUIDs below with actual IDs from your database
-- You'll need to get:
-- 1. A tenant_id from the tenants table
-- 2. A student_id from the students table

-- For this seed to work, first run these queries to get your IDs:
-- SELECT id FROM tenants LIMIT 1;
-- SELECT id FROM students LIMIT 1;

-- Then replace the placeholder values below

-- ============================================
-- STEP 1: Insert Sample Lessons for Grade 2
-- ============================================

-- Math Lessons (Grade 2)
INSERT INTO public.lessons (tenant_id, subject, grade_level, title, description, topics, order_index) VALUES
  ('YOUR_TENANT_ID', 'Math', 'Grade 2', 'Addition & Subtraction', 'Basic addition and subtraction with 2-digit numbers', ARRAY['Addition', 'Subtraction', 'Number Sense'], 1),
  ('YOUR_TENANT_ID', 'Math', 'Grade 2', 'Place Value Understanding', 'Understanding ones, tens, and hundreds place', ARRAY['Place Value', 'Number Sense'], 2),
  ('YOUR_TENANT_ID', 'Math', 'Grade 2', 'Word Problem Solving', 'Solving simple word problems with addition/subtraction', ARRAY['Word Problems', 'Critical Thinking'], 3),
  ('YOUR_TENANT_ID', 'Math', 'Grade 2', '2-Digit Subtraction', 'Subtraction with borrowing', ARRAY['Subtraction', 'Borrowing'], 4),
  ('YOUR_TENANT_ID', 'Math', 'Grade 2', 'Skip Counting', 'Counting by 2s, 5s, and 10s', ARRAY['Skip Counting', 'Patterns'], 5),
  ('YOUR_TENANT_ID', 'Math', 'Grade 2', 'Introduction to Multiplication', 'Basic multiplication concepts', ARRAY['Multiplication', 'Arrays'], 6),
  ('YOUR_TENANT_ID', 'Math', 'Grade 2', 'Measurement Basics', 'Measuring length and weight', ARRAY['Measurement', 'Units'], 7),
  ('YOUR_TENANT_ID', 'Math', 'Grade 2', 'Shapes and Geometry', 'Identifying 2D and 3D shapes', ARRAY['Geometry', 'Shapes'], 8);

-- Reading Lessons (Grade 2)
INSERT INTO public.lessons (tenant_id, subject, grade_level, title, description, topics, order_index) VALUES
  ('YOUR_TENANT_ID', 'Reading', 'Grade 2', 'Vocabulary Building', 'Learning new words and their meanings', ARRAY['Vocabulary', 'Word Recognition'], 1),
  ('YOUR_TENANT_ID', 'Reading', 'Grade 2', 'Reading Comprehension', 'Understanding what you read', ARRAY['Comprehension', 'Main Idea'], 2),
  ('YOUR_TENANT_ID', 'Reading', 'Grade 2', 'Story Retelling', 'Retelling stories in your own words', ARRAY['Retelling', 'Sequencing'], 3),
  ('YOUR_TENANT_ID', 'Reading', 'Grade 2', 'Long & Short Vowels', 'Identifying vowel sounds', ARRAY['Phonics', 'Vowels'], 4),
  ('YOUR_TENANT_ID', 'Reading', 'Grade 2', 'Sight Words Mastery', 'Recognizing common sight words', ARRAY['Sight Words', 'Fluency'], 5),
  ('YOUR_TENANT_ID', 'Reading', 'Grade 2', 'Character Analysis', 'Understanding characters in stories', ARRAY['Characters', 'Analysis'], 6),
  ('YOUR_TENANT_ID', 'Reading', 'Grade 2', 'Making Predictions', 'Predicting what happens next', ARRAY['Predictions', 'Inference'], 7),
  ('YOUR_TENANT_ID', 'Reading', 'Grade 2', 'Comparing Stories', 'Finding similarities and differences', ARRAY['Compare', 'Contrast'], 8);

-- ============================================
-- STEP 2: Insert Student Progress Records
-- ============================================

-- Math Progress (6 out of 8 lessons completed = 75%)
INSERT INTO public.student_progress (tenant_id, student_id, subject, grade_level, completed_lessons, total_lessons, progress_percentage, next_lesson_title) VALUES
  ('YOUR_TENANT_ID', 'YOUR_STUDENT_ID', 'Math', 'Grade 2', 6, 8, 75, '2-Digit Subtraction');

-- Reading Progress (3 out of 8 lessons completed = 37.5%, rounded to 38%)
INSERT INTO public.student_progress (tenant_id, student_id, subject, grade_level, completed_lessons, total_lessons, progress_percentage, next_lesson_title) VALUES
  ('YOUR_TENANT_ID', 'YOUR_STUDENT_ID', 'Reading', 'Grade 2', 3, 8, 38, 'Long & Short Vowels');

-- ============================================
-- STEP 3: Insert Today's Activities
-- ============================================

-- Today's date activities (2 completed, 2 not started)
INSERT INTO public.student_activities (tenant_id, student_id, lesson_id, subject, lesson_number, title, status, duration_minutes, completed_at) VALUES
  -- Reading Lesson 1 - Completed
  ('YOUR_TENANT_ID', 'YOUR_STUDENT_ID', NULL, 'Reading', 1, 'Practice Exercises', 'completed', 25, NOW() - INTERVAL '3 hours'),
  
  -- Reading Lesson 2 - Completed
  ('YOUR_TENANT_ID', 'YOUR_STUDENT_ID', NULL, 'Reading', 2, 'Practice Exercises', 'completed', 30, NOW() - INTERVAL '2 hours'),
  
  -- Math Lesson 3 - Not Started
  ('YOUR_TENANT_ID', 'YOUR_STUDENT_ID', NULL, 'Math', 3, 'Practice Exercises', 'not_started', 0, NULL),
  
  -- Math Lesson 4 - Not Started
  ('YOUR_TENANT_ID', 'YOUR_STUDENT_ID', NULL, 'Math', 4, 'Practice Exercises', 'not_started', 0, NULL);

-- ============================================
-- INSTRUCTIONS FOR USE:
-- ============================================
-- 1. Run this query to get your tenant_id:
--    SELECT id FROM tenants LIMIT 1;
--
-- 2. Run this query to get your student_id:
--    SELECT id FROM students LIMIT 1;
--
-- 3. Replace ALL instances of 'YOUR_TENANT_ID' with the actual tenant ID
-- 4. Replace ALL instances of 'YOUR_STUDENT_ID' with the actual student ID
-- 5. Run this entire file in the Supabase SQL Editor
