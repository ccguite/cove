-- ============================================================
-- Migration 20240017: Create Storage Bucket for Menu Images
-- Creates the public 'menu-images' bucket used by the admin
-- menu management panel for item photo uploads.
-- ============================================================

-- Insert the bucket into storage.buckets (Supabase internal table)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,               -- publicly readable (no auth required to view images)
  5242880,            -- 5 MB max file size per upload
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;  -- safe to re-run: skip if already exists

-- ── Storage RLS Policies ──────────────────────────────────────

-- Anyone can read (view menu item images publicly)
create policy "menu-images: public read"
  on storage.objects for select
  using ( bucket_id = 'menu-images' );

-- Only admin can upload
create policy "menu-images: admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'menu-images'
    and exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Only admin can update (replace image)
create policy "menu-images: admin update"
  on storage.objects for update
  using (
    bucket_id = 'menu-images'
    and exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Only admin can delete
create policy "menu-images: admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'menu-images'
    and exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );
