-- Migration: Attendance Timestamp Fix & GPS Spoofing Detection
-- Adds TIMESTAMPTZ columns to replace naive TIME columns, and adds
-- IP geolocation fields for cross-referencing against GPS claims.
-- This migration is additive and safe to run on a live database.

BEGIN;

-- 1. Add timezone-aware timestamp columns (server-generated UTC)
ALTER TABLE public.staff_attendance
    ADD COLUMN IF NOT EXISTS check_in_at  TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS check_out_at TIMESTAMPTZ;

-- 2. Backfill from existing TIME columns where possible
--    (Assumes records from today; older records will remain NULL)
UPDATE public.staff_attendance
SET
    check_in_at  = (date + check_in_time)  AT TIME ZONE 'UTC'
WHERE check_in_time IS NOT NULL AND check_in_at IS NULL;

UPDATE public.staff_attendance
SET
    check_out_at = (date + check_out_time) AT TIME ZONE 'UTC'
WHERE check_out_time IS NOT NULL AND check_out_at IS NULL;

-- 3. IP Geolocation fields for spoofing detection
ALTER TABLE public.staff_attendance
    ADD COLUMN IF NOT EXISTS ip_country       TEXT,
    ADD COLUMN IF NOT EXISTS ip_city          TEXT,
    ADD COLUMN IF NOT EXISTS ip_latitude      DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS ip_longitude     DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS ip_geo_distance_km DOUBLE PRECISION,  -- Distance between IP location & GPS claim
    ADD COLUMN IF NOT EXISTS spoofing_risk    TEXT DEFAULT 'low';  -- 'low', 'medium', 'high'

-- 4. Index for forensic queries (admins filtering by risk level)
CREATE INDEX IF NOT EXISTS idx_staff_attendance_spoofing_risk
    ON public.staff_attendance (tenant_id, spoofing_risk)
    WHERE spoofing_risk != 'low';

COMMIT;
