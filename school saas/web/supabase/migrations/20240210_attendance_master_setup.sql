-- ==========================================
-- 1. FIX STAFF ATTENDANCE (Add Missing Columns)
-- ==========================================
DO $$
BEGIN
    -- Add latitude if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_attendance' AND column_name = 'latitude') THEN
        ALTER TABLE public.staff_attendance ADD COLUMN latitude DOUBLE PRECISION;
    END IF;

    -- Add longitude if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_attendance' AND column_name = 'longitude') THEN
        ALTER TABLE public.staff_attendance ADD COLUMN longitude DOUBLE PRECISION;
    END IF;

    -- Add distance_meters if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_attendance' AND column_name = 'distance_meters') THEN
        ALTER TABLE public.staff_attendance ADD COLUMN distance_meters DOUBLE PRECISION;
    END IF;

    -- Add location_verified if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_attendance' AND column_name = 'location_verified') THEN
        ALTER TABLE public.staff_attendance ADD COLUMN location_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ==========================================
-- 2. CREATE SCHOOL LOCATIONS (For Geofencing)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.school_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER DEFAULT 100,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for School Locations
ALTER TABLE public.school_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read locations" ON public.school_locations;
CREATE POLICY "Read locations" ON public.school_locations
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM profiles WHERE tenant_id = school_locations.tenant_id));



CREATE INDEX IF NOT EXISTS idx_attendance_registers_class_date ON public.attendance_registers(class_id, date);

-- ==========================================
-- 4. CREATE STUDENT ATTENDANCE (Individual)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    register_id UUID REFERENCES public.attendance_registers(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'present',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(register_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_attendance_student ON public.student_attendance(student_id);

-- ==========================================
-- 5. RLS POLICIES (Student Attendance)
-- ==========================================
ALTER TABLE public.attendance_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- Registers w/ Explicit Drops
DROP POLICY IF EXISTS "Read registers" ON public.attendance_registers;
CREATE POLICY "Read registers" ON public.attendance_registers
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM profiles WHERE tenant_id = attendance_registers.tenant_id));

DROP POLICY IF EXISTS "Manage registers" ON public.attendance_registers;
CREATE POLICY "Manage registers" ON public.attendance_registers
    FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'principal', 'registrar')));

-- Student Attendance w/ Explicit Drops
DROP POLICY IF EXISTS "Read student attendance" ON public.student_attendance;
CREATE POLICY "Read student attendance" ON public.student_attendance
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.attendance_registers r
        JOIN public.profiles p ON p.tenant_id = r.tenant_id
        WHERE r.id = student_attendance.register_id AND p.id = auth.uid()
    ));

DROP POLICY IF EXISTS "Manage student attendance" ON public.student_attendance;
CREATE POLICY "Manage student attendance" ON public.student_attendance
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.attendance_registers r
        JOIN public.profiles p ON p.tenant_id = r.tenant_id
        WHERE r.id = student_attendance.register_id 
        AND p.id = auth.uid() 
        AND p.role IN ('admin', 'teacher', 'principal', 'registrar')
    ));
