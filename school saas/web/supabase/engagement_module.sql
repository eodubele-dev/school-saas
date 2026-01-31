-- Daily Engagement Module Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. STUDENT ATTENDANCE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_attendance (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
    student_id uuid REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    status text CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
    marked_by uuid REFERENCES public.profiles(id),
    marked_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    notes text,
    sms_sent boolean DEFAULT false,
    sms_sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_attendance_date ON public.student_attendance(date DESC);
CREATE INDEX IF NOT EXISTS idx_student_attendance_student ON public.student_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_class ON public.student_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_tenant ON public.student_attendance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_status ON public.student_attendance(status) WHERE status = 'absent';

-- ============================================
-- 2. CLASS FEED POSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.class_feed_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    teacher_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    post_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post attachments (photos)
CREATE TABLE IF NOT EXISTS public.post_attachments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid REFERENCES public.class_feed_posts(id) ON DELETE CASCADE NOT NULL,
    file_url text NOT NULL,
    file_type text,
    file_size integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_class_feed_posts_class ON public.class_feed_posts(class_id);
CREATE INDEX IF NOT EXISTS idx_class_feed_posts_date ON public.class_feed_posts(post_date DESC);
CREATE INDEX IF NOT EXISTS idx_class_feed_posts_tenant ON public.class_feed_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_post_attachments_post ON public.post_attachments(post_id);

-- ============================================
-- 3. SCHOOL LOCATIONS TABLE (for geofencing)
-- ============================================

CREATE TABLE IF NOT EXISTS public.school_locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) NOT NULL,
    name text NOT NULL,
    latitude numeric(10, 8) NOT NULL,
    longitude numeric(11, 8) NOT NULL,
    radius_meters integer DEFAULT 100,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_school_locations_tenant ON public.school_locations(tenant_id);

-- ============================================
-- 4. ENHANCE STAFF ATTENDANCE TABLE
-- ============================================

-- Add geolocation fields to existing staff_attendance table
DO $$ 
BEGIN
    -- Add latitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_attendance' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE public.staff_attendance ADD COLUMN latitude numeric(10, 8);
    END IF;

    -- Add longitude column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_attendance' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE public.staff_attendance ADD COLUMN longitude numeric(11, 8);
    END IF;

    -- Add distance_meters column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_attendance' AND column_name = 'distance_meters'
    ) THEN
        ALTER TABLE public.staff_attendance ADD COLUMN distance_meters numeric(10, 2);
    END IF;

    -- Add location_verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff_attendance' AND column_name = 'location_verified'
    ) THEN
        ALTER TABLE public.staff_attendance ADD COLUMN location_verified boolean DEFAULT false;
    END IF;
END $$;

-- ============================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_locations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Student attendance viewable by tenant" ON public.student_attendance;
DROP POLICY IF EXISTS "Teachers can mark student attendance" ON public.student_attendance;
DROP POLICY IF EXISTS "Teachers can update student attendance" ON public.student_attendance;
DROP POLICY IF EXISTS "Class feed viewable by tenant" ON public.class_feed_posts;
DROP POLICY IF EXISTS "Teachers can create posts" ON public.class_feed_posts;
DROP POLICY IF EXISTS "Teachers can update own posts" ON public.class_feed_posts;
DROP POLICY IF EXISTS "Teachers can delete own posts" ON public.class_feed_posts;
DROP POLICY IF EXISTS "Attachments viewable by tenant" ON public.post_attachments;
DROP POLICY IF EXISTS "Teachers can add attachments" ON public.post_attachments;
DROP POLICY IF EXISTS "School locations viewable by tenant" ON public.school_locations;

-- Student Attendance Policies
CREATE POLICY "Student attendance viewable by tenant" ON public.student_attendance
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

CREATE POLICY "Teachers can mark student attendance" ON public.student_attendance
    FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id());

CREATE POLICY "Teachers can update student attendance" ON public.student_attendance
    FOR UPDATE USING (tenant_id = get_auth_tenant_id());

-- Class Feed Policies
CREATE POLICY "Class feed viewable by tenant" ON public.class_feed_posts
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

CREATE POLICY "Teachers can create posts" ON public.class_feed_posts
    FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id());

CREATE POLICY "Teachers can update own posts" ON public.class_feed_posts
    FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete own posts" ON public.class_feed_posts
    FOR DELETE USING (teacher_id = auth.uid());

-- Post Attachments Policies
CREATE POLICY "Attachments viewable by tenant" ON public.post_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.class_feed_posts 
            WHERE id = post_attachments.post_id 
            AND tenant_id = get_auth_tenant_id()
        )
    );

CREATE POLICY "Teachers can add attachments" ON public.post_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.class_feed_posts 
            WHERE id = post_attachments.post_id 
            AND teacher_id = auth.uid()
        )
    );

-- School Locations Policies
CREATE POLICY "School locations viewable by tenant" ON public.school_locations
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 numeric, lon1 numeric,
    lat2 numeric, lon2 numeric
) RETURNS numeric AS $$
DECLARE
    earth_radius numeric := 6371000; -- Earth radius in meters
    dlat numeric;
    dlon numeric;
    a numeric;
    c numeric;
BEGIN
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlon/2) * sin(dlon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get primary school location for a tenant
CREATE OR REPLACE FUNCTION get_primary_school_location(p_tenant_id uuid)
RETURNS TABLE (
    latitude numeric,
    longitude numeric,
    radius_meters integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT sl.latitude, sl.longitude, sl.radius_meters
    FROM public.school_locations sl
    WHERE sl.tenant_id = p_tenant_id AND sl.is_primary = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. VERIFICATION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Daily Engagement Module schema created successfully!';
    RAISE NOTICE 'Tables created: student_attendance, class_feed_posts, post_attachments, school_locations';
END $$;
