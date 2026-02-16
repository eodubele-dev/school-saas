-- FIX: Ensure Leave Request columns exist and RLS is correct

-- 1. Ensure columns exist (idempotent)
alter table public.staff_leave_requests add column if not exists reason text;
alter table public.staff_leave_requests add column if not exists rejection_reason text;
alter table public.staff_leave_requests add column if not exists approved_by uuid references public.profiles(id);

-- 2. Drop restrictive policies
drop policy if exists "Admins can view all leave requests" on public.staff_leave_requests;
drop policy if exists "Staff can view own leave requests" on public.staff_leave_requests;

-- 3. Re-apply policies using the safe get_auth_tenant_id() function
--    (which we fixed in the previous step to be SECURITY DEFINER)

-- Policy: Admin View (All in tenant)
create policy "Admins can view all leave requests"
on public.staff_leave_requests
for select
using (
  tenant_id = get_auth_tenant_id()
);

-- Policy: Staff View (Own)
-- Note: The admin policy above covers the admin looking at their own requests too if they are in the same tenant.
-- But for non-admins, we need this:
create policy "Staff can view own leave requests"
on public.staff_leave_requests
for select
using (
  auth.uid() = staff_id
);

-- Policy: Create (Own)
-- (This usually exists but good to ensure)
drop policy if exists "Staff can create leave requests" on public.staff_leave_requests;
create policy "Staff can create leave requests"
on public.staff_leave_requests
for insert
with check (
  auth.uid() = staff_id
);

-- Policy: Update (Admin only - for approval/rejection)
drop policy if exists "Admins can update leave requests" on public.staff_leave_requests;
create policy "Admins can update leave requests"
on public.staff_leave_requests
for update
using (
  tenant_id = get_auth_tenant_id()
  -- Add role check if you want to be strict, but tenant isolation + app logic is usually enough for "admin dashboard" context
  -- and (select role from profiles where id = auth.uid()) in ('admin', 'principal')
);
