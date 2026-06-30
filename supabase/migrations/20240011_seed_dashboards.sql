-- Seed Admin user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a8ad2d32-e0ee-40ef-8e5b-381c00222001',
  'authenticated', 'authenticated',
  'admin@cove.com',
  extensions.crypt('CoveAdmin2026!#', extensions.gen_salt('bf', 10)),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Cove Admin"}',
  false, now(), now()
)
ON CONFLICT (id) DO NOTHING;

-- Seed Staff user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b8ad2d32-e0ee-40ef-8e5b-381c00222002',
  'authenticated', 'authenticated',
  'staff@cove.com',
  extensions.crypt('CoveStaff2026!#', extensions.gen_salt('bf', 10)),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Cove Staff"}',
  false, now(), now()
)
ON CONFLICT (id) DO NOTHING;

-- Ensure public.users profiles have correct roles
INSERT INTO public.users (id, email, name, role)
VALUES 
  ('a8ad2d32-e0ee-40ef-8e5b-381c00222001', 'admin@cove.com', 'Cove Admin', 'admin'),
  ('b8ad2d32-e0ee-40ef-8e5b-381c00222002', 'staff@cove.com', 'Cove Staff', 'staff')
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, name = EXCLUDED.name;
