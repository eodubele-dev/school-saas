-- Create Attendance Registers Table (One per class per day)
CREATE TABLE IF NOT EXISTS public.attendance_registers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    marked_by UUID REFERENCES public.profiles(id), -- Teacher who took attendance
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, date)
);

-- Index for querying
CREATE INDEX IF NOT EXISTS idx_attendance_registers_class_date ON public.attendance_registers(class_id, date);

-- Create Student Attendance Table (Individual records)
CREATE TABLE IF NOT EXISTS public.student_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    register_id UUID REFERENCES public.attendance_registers(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'present', -- present, absent, late, excused
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(register_id, student_id)
);

-- Index for querying student history
CREATE INDEX IF NOT EXISTS idx_student_attendance_student ON public.student_attendance(student_id);

-- Add RLS Policies
ALTER TABLE public.attendance_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- 1. Read access (Everyone in tenant)
DROP POLICY IF EXISTS "Read registers" ON public.attendance_registers;
CREATE POLICY "Read registers" ON public.attendance_registers
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM profiles WHERE tenant_id = attendance_registers.tenant_id));

DROP POLICY IF EXISTS "Read student attendance" ON public.student_attendance;
CREATE POLICY "Read student attendance" ON public.student_attendance
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.attendance_registers r
        JOIN public.profiles p ON p.tenant_id = r.tenant_id
        WHERE r.id = student_attendance.register_id AND p.id = auth.uid()
    ));

-- 2. Insert/Update access (Teachers/Admins)
-- Ideally strictly role-based, but for now allow authenticated staff
DROP POLICY IF EXISTS "Manage registers" ON public.attendance_registers;
CREATE POLICY "Manage registers" ON public.attendance_registers
    FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'principal', 'registrar')));

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
