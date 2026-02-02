-- Create a public bucket for passports
insert into storage.buckets (id, name, public)
values ('passports', 'passports', true)
on conflict (id) do nothing;

-- Set up access policies
-- 1. Allow public read access (for passports to be viewable)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'passports' );

-- 2. Allow authenticated users to upload
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'passports' and auth.role() = 'authenticated' );

-- 3. Allow users to update their own uploads
create policy "Owner Update"
  on storage.objects for update
  using ( bucket_id = 'passports' and auth.uid() = owner );
