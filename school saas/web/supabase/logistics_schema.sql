-- SAFE-ROUTE LOGISTICS SCHEMA

-- 1. Routes (The Bus/Driver/Zone)
CREATE TABLE IF NOT EXISTS transport_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Lekki Phase 1 - Bus A"
    driver_name TEXT,
    driver_phone TEXT,
    vehicle_number TEXT, -- License Plate
    attendant_name TEXT,
    capacity INTEGER DEFAULT 14,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Assignments (Which student takes which bus)
CREATE TABLE IF NOT EXISTS transport_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    stop_location TEXT, -- e.g. "Admiralty Way, Gate 2"
    direction TEXT DEFAULT 'both', -- 'pickup', 'dropoff', 'both'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, route_id) -- Prevent loose duplicates
);

-- 3. Daily Manifest (The Trip Log)
CREATE TABLE IF NOT EXISTS transport_manifest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    route_id UUID REFERENCES transport_routes(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    direction TEXT CHECK (direction IN ('pickup', 'dropoff')),
    status TEXT CHECK (status IN ('pending', 'active', 'completed')) DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Manifest Items (Student Status per trip)
CREATE TABLE IF NOT EXISTS transport_manifest_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_id UUID REFERENCES transport_manifest(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'boarded', 'dropped', 'absent')) DEFAULT 'pending',
    boarded_at TIMESTAMPTZ,
    dropped_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Fleet Maintenance (Expense Integration)
CREATE TABLE IF NOT EXISTS transport_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    route_id UUID REFERENCES transport_routes(id) ON DELETE SET NULL, -- Which bus?
    type TEXT CHECK (type IN ('fuel', 'repair', 'service', 'other')),
    cost DECIMAL(12,2) NOT NULL,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transport_assignments_route ON transport_assignments(route_id);
CREATE INDEX IF NOT EXISTS idx_transport_manifest_date ON transport_manifest(date, route_id);
CREATE INDEX IF NOT EXISTS idx_transport_items_manifest ON transport_manifest_items(manifest_id);

-- RLS (Admin Only for now, or Driver/Attendant role later)
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_manifest_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_maintenance ENABLE ROW LEVEL SECURITY;

-- Simple Policy: Admins/Staff can access all in their tenant
CREATE POLICY "Staff Full Access Transport" ON transport_routes
    USING (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.tenant_id = transport_routes.tenant_id
            and profiles.role IN ('admin', 'teacher', 'bursar') -- simplified
        )
    );
-- (Repeating policy for simplicity in this script, usually we use a shared function)

-- Note: In a real expanded app, we'd add 'driver' role. For now, Admin manages it.
