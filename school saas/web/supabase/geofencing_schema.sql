-- Geofencing & Location Schema

-- 1. Update Staff Attendance for Geolocation
ALTER TABLE public.staff_attendance
ADD COLUMN IF NOT EXISTS clock_in_coords JSONB, -- { lat: number, lng: number, accuracy: number }
ADD COLUMN IF NOT EXISTS clock_out_coords JSONB,
ADD COLUMN IF NOT EXISTS is_geofence_verified BOOLEAN DEFAULT false; -- True if within radius

-- 2. Geofence Settings (Per Tenant/School)
CREATE TABLE IF NOT EXISTS public.geofence_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) NOT NULL UNIQUE, -- One primary location per tenant for MVP
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER DEFAULT 100, -- Default 100m radius
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.geofence_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Geofence settings viewable by tenant" ON public.geofence_settings
    FOR SELECT USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update geofence settings" ON public.geofence_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin' AND tenant_id = geofence_settings.tenant_id
        )
    );
