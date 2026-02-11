-- FIX: Hostel Module RLS Policies
-- Adding missing policies for maintenance and other hostel structures

BEGIN;

-- 1. Maintenance Items
DROP POLICY IF EXISTS "Maintenance viewable by tenant" ON public.maintenance_items;
CREATE POLICY "Maintenance viewable by tenant" ON public.maintenance_items
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS "Users can log maintenance" ON public.maintenance_items;
CREATE POLICY "Users can log maintenance" ON public.maintenance_items
    FOR INSERT WITH CHECK (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS "Admins/Staff can update maintenance" ON public.maintenance_items;
CREATE POLICY "Admins/Staff can update maintenance" ON public.maintenance_items
    FOR UPDATE USING (tenant_id = get_auth_tenant_id());

-- 2. Hostel Rooms
DROP POLICY IF EXISTS "Rooms viewable by tenant" ON public.hostel_rooms;
CREATE POLICY "Rooms viewable by tenant" ON public.hostel_rooms
    FOR SELECT USING (
        exists (
            select 1 from hostel_buildings b
            where b.id = building_id and b.tenant_id = get_auth_tenant_id()
        )
    );

-- 3. Hostel Bunks
DROP POLICY IF EXISTS "Bunks viewable by tenant" ON public.hostel_bunks;
CREATE POLICY "Bunks viewable by tenant" ON public.hostel_bunks
    FOR SELECT USING (
        exists (
            select 1 from hostel_rooms r
            join hostel_buildings b on b.id = r.building_id
            where r.id = room_id and b.tenant_id = get_auth_tenant_id()
        )
    );

-- 4. Hostel Allocations
DROP POLICY IF EXISTS "Allocations viewable by tenant" ON public.hostel_allocations;
CREATE POLICY "Allocations viewable by tenant" ON public.hostel_allocations
    FOR SELECT USING (tenant_id = get_auth_tenant_id());

DROP POLICY IF EXISTS "Admins can manage allocations" ON public.hostel_allocations;
CREATE POLICY "Admins can manage allocations" ON public.hostel_allocations
    FOR ALL USING (tenant_id = get_auth_tenant_id());

COMMIT;
