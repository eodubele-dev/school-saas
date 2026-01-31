-- STEP 1: First, run this query to get your IDs:
-- SELECT id FROM tenants LIMIT 1;
-- SELECT id FROM students LIMIT 1;

-- STEP 2: Replace the UUIDs in the WITH clause below with your actual IDs
-- Then run this entire script

WITH ids AS (
  SELECT 
    'PASTE_YOUR_TENANT_ID_HERE'::uuid AS tenant_id,
    'PASTE_YOUR_STUDENT_ID_HERE'::uuid AS student_id
)

-- Insert Math Lessons (Grade 2)
INSERT INTO public.lessons (tenant_id, subject, grade_level, title, description, topics, order_index)
SELECT 
  ids.tenant_id,
  'Math',
  'Grade 2',
  lesson_data.title,
  lesson_data.description,
  lesson_data.topics,
  lesson_data.order_index
FROM ids, (VALUES
  ('Addition & Subtraction', 'Basic addition and subtraction with 2-digit numbers', ARRAY['Addition', 'Subtraction', 'Number Sense'], 1),
  ('Place Value Understanding', 'Understanding ones, tens, and hundreds place', ARRAY['Place Value', 'Number Sense'], 2),
  ('Word Problem Solving', 'Solving simple word problems with addition/subtraction', ARRAY['Word Problems', 'Critical Thinking'], 3),
  ('2-Digit Subtraction', 'Subtraction with borrowing', ARRAY['Subtraction', 'Borrowing'], 4),
  ('Skip Counting', 'Counting by 2s, 5s, and 10s', ARRAY['Skip Counting', 'Patterns'], 5),
  ('Introduction to Multiplication', 'Basic multiplication concepts', ARRAY['Multiplication', 'Arrays'], 6),
  ('Measurement Basics', 'Measuring length and weight', ARRAY['Measurement', 'Units'], 7),
  ('Shapes and Geometry', 'Identifying 2D and 3D shapes', ARRAY['Geometry', 'Shapes'], 8)
) AS lesson_data(title, description, topics, order_index);

-- Insert Reading Lessons (Grade 2)
INSERT INTO public.lessons (tenant_id, subject, grade_level, title, description, topics, order_index)
SELECT 
  ids.tenant_id,
  'Reading',
  'Grade 2',
  lesson_data.title,
  lesson_data.description,
  lesson_data.topics,
  lesson_data.order_index
FROM ids, (VALUES
  ('Vocabulary Building', 'Learning new words and their meanings', ARRAY['Vocabulary', 'Word Recognition'], 1),
  ('Reading Comprehension', 'Understanding what you read', ARRAY['Comprehension', 'Main Idea'], 2),
  ('Story Retelling', 'Retelling stories in your own words', ARRAY['Retelling', 'Sequencing'], 3),
  ('Long & Short Vowels', 'Identifying vowel sounds', ARRAY['Phonics', 'Vowels'], 4),
  ('Sight Words Mastery', 'Recognizing common sight words', ARRAY['Sight Words', 'Fluency'], 5),
  ('Character Analysis', 'Understanding characters in stories', ARRAY['Characters', 'Analysis'], 6),
  ('Making Predictions', 'Predicting what happens next', ARRAY['Predictions', 'Inference'], 7),
  ('Comparing Stories', 'Finding similarities and differences', ARRAY['Compare', 'Contrast'], 8)
) AS lesson_data(title, description, topics, order_index);

-- Insert Student Progress Records
INSERT INTO public.student_progress (tenant_id, student_id, subject, grade_level, completed_lessons, total_lessons, progress_percentage, next_lesson_title)
SELECT 
  ids.tenant_id,
  ids.student_id,
  progress_data.subject,
  progress_data.grade_level,
  progress_data.completed_lessons,
  progress_data.total_lessons,
  progress_data.progress_percentage,
  progress_data.next_lesson_title
FROM ids, (VALUES
  ('Math', 'Grade 2', 6, 8, 75, '2-Digit Subtraction'),
  ('Reading', 'Grade 2', 3, 8, 38, 'Long & Short Vowels')
) AS progress_data(subject, grade_level, completed_lessons, total_lessons, progress_percentage, next_lesson_title);

-- Insert Today's Activities
INSERT INTO public.student_activities (tenant_id, student_id, lesson_id, subject, lesson_number, title, status, duration_minutes, completed_at)
SELECT 
  ids.tenant_id,
  ids.student_id,
  activity_data.lesson_id,
  activity_data.subject,
  activity_data.lesson_number,
  activity_data.title,
  activity_data.status,
  activity_data.duration_minutes,
  activity_data.completed_at
FROM ids, (VALUES
  (NULL, 'Reading', 1, 'Practice Exercises', 'completed', 25, NOW() - INTERVAL '3 hours'),
  (NULL, 'Reading', 2, 'Practice Exercises', 'completed', 30, NOW() - INTERVAL '2 hours'),
  (NULL, 'Math', 3, 'Practice Exercises', 'not_started', 0, NULL),
  (NULL, 'Math', 4, 'Practice Exercises', 'not_started', 0, NULL)
) AS activity_data(lesson_id, subject, lesson_number, title, status, duration_minutes, completed_at);

-- Verify the data was inserted
SELECT 'Lessons inserted: ' || COUNT(*)::text FROM lessons WHERE tenant_id = (SELECT tenant_id FROM ids);
SELECT 'Progress records inserted: ' || COUNT(*)::text FROM student_progress WHERE student_id = (SELECT student_id FROM ids);
SELECT 'Activities inserted: ' || COUNT(*)::text FROM student_activities WHERE student_id = (SELECT student_id FROM ids);
