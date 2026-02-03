-- DORM-MASTER HOSTEL MANAGEMENT SCHEMA

-- 1. Hostel Buildings (e.g., "Murtala Hall", "Queen Amina Hall")
CREATE TABLE IF NOT EXISTS hostel_buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('male', 'female', 'mixed')) NOT NULL,
    capacity_students INTEGER DEFAULT 0,
    house_master_id UUID REFERENCES profiles(id), -- Staff in charge
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hostel Rooms (e.g., "Room 101", "Room A")
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES hostel_buildings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    floor INTEGER DEFAULT 0, -- 0 = Ground, 1 = First, etc.
    capacity INTEGER DEFAULT 4,
    features JSONB DEFAULT '[]'::jsonb, -- e.g. ["ensuite", "ac"]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bunks/Bed Spaces (Granular allocation)
CREATE TABLE IF NOT EXISTS hostel_bunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- e.g. "Bunk 1-Top", "Bunk 1-Bottom"
    type TEXT CHECK (type IN ('top', 'bottom', 'single')) DEFAULT 'single',
    is_serviceable BOOLEAN DEFAULT TRUE, -- False if broken
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Allocations (Student -> Bunk)
CREATE TABLE IF NOT EXISTS hostel_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    bunk_id UUID REFERENCES hostel_bunks(id) ON DELETE SET NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    session TEXT NOT NULL, -- e.g. "2025/2026"
    term TEXT NOT NULL,    -- e.g. "1st Term"
    allocated_at TIMESTAMPTZ DEFAULT NOW(),
    allocated_by UUID, -- Profile/User ID who did the assignment
    status TEXT CHECK (status IN ('active', 'vacated')) DEFAULT 'active',
    UNIQUE(student_id, session, term) -- Student can only have one bed per term
);

-- 5. Inventory Items (Assets tracking)
CREATE TABLE IF NOT EXISTS hostel_inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Standard Mattress", "Metal Locker"
    total_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    condition TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Inventory Assignments (Who has what)
CREATE TABLE IF NOT EXISTS hostel_inventory_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID REFERENCES hostel_inventory_items(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    returned_at TIMESTAMPTZ,
    condition_on_issue TEXT DEFAULT 'good',
    condition_on_return TEXT,
    status TEXT CHECK (status IN ('issued', 'returned', 'lost')) DEFAULT 'issued'
);

-- 7. Daily Roll Call (Night Check)
CREATE TABLE IF NOT EXISTS hostel_roll_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    building_id UUID REFERENCES hostel_buildings(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    checked_by UUID, -- House Master User ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- 8. Roll Call Entries (Individual Student Status)
CREATE TABLE IF NOT EXISTS hostel_roll_call_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_call_id UUID REFERENCES hostel_roll_calls(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('present', 'absent', 'sick_bay', 'exeat')) NOT NULL,
    time_marked TIMESTAMPTZ DEFAULT NOW(),
    remark TEXT
);

-- 9. Maintenance Requests (Tickets)
CREATE TABLE IF NOT EXISTS maintenance_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    location_type TEXT CHECK (location_type IN ('hostel_room', 'class', 'general')) DEFAULT 'hostel_room',
    location_id UUID, -- References room_id or class_id depending on type
    reported_by UUID, -- Profile ID
    title TEXT NOT NULL, -- e.g. "Broken Fan"
    description TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved')) DEFAULT 'pending',
    assigned_to UUID, -- Maintenance Staff Profile ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hostel_allocations_student ON hostel_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_hostel_allocations_bunk ON hostel_allocations(bunk_id);
CREATE INDEX IF NOT EXISTS idx_hostel_rooms_building ON hostel_rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_roll_call_date ON hostel_roll_calls(date, building_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_items(status);

-- RLS Policies (Simplified for Admin/Staff)
ALTER TABLE hostel_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_bunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_inventory_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_roll_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel_roll_call_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/Staff Access Hostels" ON hostel_buildings
    USING (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.tenant_id = hostel_buildings.tenant_id
            and profiles.role IN ('admin', 'teacher', 'bursar', 'support_staff')
        )
    );
-- ... (Repeat similar policies normally, omitted for brevity in script)
