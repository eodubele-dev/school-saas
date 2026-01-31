-- Quick Diagnostic Query
-- Run this in Supabase SQL Editor to check if tables exist and have data

-- Check if tables exist
SELECT 
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'tenants') THEN '✅' ELSE '❌' END as tenants_table,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'students') THEN '✅' ELSE '❌' END as students_table,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'lessons') THEN '✅' ELSE '❌' END as lessons_table,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'student_progress') THEN '✅' ELSE '❌' END as progress_table,
    CASE WHEN EXISTS (SELECT FROM pg_tables WHERE tablename = 'student_activities') THEN '✅' ELSE '❌' END as activities_table;

-- Check data counts
SELECT 
    'Data Counts' as info,
    (SELECT COUNT(*) FROM tenants) as tenants,
    (SELECT COUNT(*) FROM students) as students,
    (SELECT COUNT(*) FROM lessons) as lessons,
    (SELECT COUNT(*) FROM student_progress) as progress,
    (SELECT COUNT(*) FROM student_activities) as activities;

-- If all tables exist but no data, you need to run complete_setup.sql
-- If tables don't exist, you need to run migration.sql first, then complete_setup.sql
