-- ============================================================
-- Migration 20240018: Add image_url to rooms + room-photos bucket
-- ============================================================

-- 1. Add image_url column to rooms
alter table public.rooms
  add column if not exists image_url text;

-- 2. Create room-photos storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'room-photos',
  'room-photos',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 3. Storage RLS for room-photos
create policy "room-photos: public read"
  on storage.objects for select
  using ( bucket_id = 'room-photos' );

create policy "room-photos: admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'room-photos'
    and exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "room-photos: admin update"
  on storage.objects for update
  using (
    bucket_id = 'room-photos'
    and exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "room-photos: admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'room-photos'
    and exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
