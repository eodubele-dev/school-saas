-- Production Hardening for Staff Attendance
-- Adds forensic columns for auditability and spoofing protection.

BEGIN;

ALTER TABLE public.staff_attendance 
ADD COLUMN IF NOT EXISTS check_in_ip TEXT,
ADD COLUMN IF NOT EXISTS check_out_ip TEXT,
ADD COLUMN IF NOT EXISTS verification_method TEXT, -- 'gps', 'trusted_ip', 'pin'
ADD COLUMN IF NOT EXISTS device_info TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS distance_meters DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;

COMMIT;
