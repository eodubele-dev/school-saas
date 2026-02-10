-- Create Staff Attendance Table
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIME,
    check_out_time TIME,
    status TEXT DEFAULT 'present', -- present, late, absent (calculated or set)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, date)
);

-- Index for querying by date and tenant
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date_tenant ON public.staff_attendance(date, tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON public.staff_attendance(staff_id);

-- Create Staff Leave Requests Table
CREATE TABLE IF NOT EXISTS public.staff_leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL, -- Sick, Casual, Annual, etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES public.profiles(id), -- Admin who approved
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering requests
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_tenant_status ON public.staff_leave_requests(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_staff ON public.staff_leave_requests(staff_id);

-- Add RLS Policies (Basic)
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_leave_requests ENABLE ROW LEVEL SECURITY;

-- 1. Read access for staff_attendance
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.staff_attendance;
CREATE POLICY "Enable read access for authenticated users" ON public.staff_attendance
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM profiles WHERE tenant_id = staff_attendance.tenant_id));

-- 2. Read access for staff_leave_requests
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.staff_leave_requests;
CREATE POLICY "Enable read access for authenticated users" ON public.staff_leave_requests
    FOR SELECT
    USING (auth.uid() IN (SELECT id FROM profiles WHERE tenant_id = staff_leave_requests.tenant_id));

-- 3. Insert access for staff_leave_requests (Self)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.staff_leave_requests;
CREATE POLICY "Enable insert for authenticated users" ON public.staff_leave_requests
    FOR INSERT
    WITH CHECK (auth.uid() = staff_id);

-- 4. Update access for staff_leave_requests (Admins)
DROP POLICY IF EXISTS "Enable update for admins" ON public.staff_leave_requests;
CREATE POLICY "Enable update for admins" ON public.staff_leave_requests
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Insert access for staff_attendance (Clock-in)
DROP POLICY IF EXISTS "Enable insert for staff clock-in" ON public.staff_attendance;
CREATE POLICY "Enable insert for staff clock-in" ON public.staff_attendance
    FOR INSERT
    WITH CHECK (auth.uid() = staff_id);
