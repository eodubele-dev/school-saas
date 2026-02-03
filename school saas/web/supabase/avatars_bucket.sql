-- Create a public bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up access policies for Avatars

-- 1. Allow public read access (for avatars to be viewable)
create policy "Avatars Public Access"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 2. Allow authenticated users to upload their own avatar
create policy "Avatars Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- 3. Allow users to update their own uploads
create policy "Avatars Owner Update"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- 4. Allow users to delete their own uploads (optional, but good for cleanup)
create policy "Avatars Owner Delete"
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.uid() = owner );
