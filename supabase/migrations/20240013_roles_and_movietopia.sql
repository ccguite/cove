-- 1. Delete the old staff user credentials (staff@cove.com) FIRST
--    so that no row with role='staff' exists when the new constraint is added.
DELETE FROM public.users WHERE id = 'b8ad2d32-e0ee-40ef-8e5b-381c00222002';
DELETE FROM auth.users WHERE id = 'b8ad2d32-e0ee-40ef-8e5b-381c00222002';
-- Also delete by email in case the ID differs
DELETE FROM public.users WHERE email = 'staff@cove.com';
DELETE FROM auth.users WHERE email = 'staff@cove.com';

-- 2. Update public.users.role allowed values constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'reception', 'kitchen', 'admin'));

-- 3. Provision StaffReception (reception@cove.com / CoveReception2026!#)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  email_change, email_change_token_current, email_change_token_new,
  phone_change, phone_change_token, reauthentication_token, recovery_token,
  is_anonymous, is_sso_user, confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'c8ad2d32-e0ee-40ef-8e5b-381c00222003',
  'authenticated', 'authenticated',
  'reception@cove.com',
  extensions.crypt('CoveReception2026!#', extensions.gen_salt('bf', 10)),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "StaffReception"}',
  false, now(), now(),
  '', '', '', '', '', '', '', false, false, ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, role)
VALUES ('c8ad2d32-e0ee-40ef-8e5b-381c00222003', 'reception@cove.com', 'StaffReception', 'reception')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name;

-- 4. Provision StaffKitchen (kitchen@cove.com / CoveKitchen2026!#)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  email_change, email_change_token_current, email_change_token_new,
  phone_change, phone_change_token, reauthentication_token, recovery_token,
  is_anonymous, is_sso_user, confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd8ad2d32-e0ee-40ef-8e5b-381c00222004',
  'authenticated', 'authenticated',
  'kitchen@cove.com',
  extensions.crypt('CoveKitchen2026!#', extensions.gen_salt('bf', 10)),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "StaffKitchen"}',
  false, now(), now(),
  '', '', '', '', '', '', '', false, false, ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, name, role)
VALUES ('d8ad2d32-e0ee-40ef-8e5b-381c00222004', 'kitchen@cove.com', 'StaffKitchen', 'kitchen')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name;

-- 5. Rename room Haven to Movietopia in public.rooms
UPDATE public.rooms SET name = 'Movietopia', slug = 'movietopia' WHERE slug = 'haven';

-- 6. Add operational status column to public.rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Available';
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_status_check;
ALTER TABLE public.rooms ADD CONSTRAINT rooms_status_check CHECK (status IN ('Available', 'Occupied', 'Needs Cleaning', 'Cleaning', 'Ready', 'Maintenance'));

-- 7. Update table security policies (RLS) for Reception, Kitchen, and Admin
DROP POLICY IF EXISTS "bookings: staff read all" ON public.bookings;
CREATE POLICY "bookings: staff read all" ON public.bookings
  FOR SELECT USING (public.get_user_role() IN ('reception', 'admin'));

DROP POLICY IF EXISTS "booking_food_items: staff read all" ON public.booking_food_items;
CREATE POLICY "booking_food_items: staff read all" ON public.booking_food_items
  FOR SELECT USING (public.get_user_role() IN ('reception', 'admin'));

DROP POLICY IF EXISTS "orders: staff read all" ON public.orders;
CREATE POLICY "orders: staff read all" ON public.orders
  FOR SELECT USING (public.get_user_role() IN ('reception', 'kitchen', 'admin'));

DROP POLICY IF EXISTS "orders: staff update status" ON public.orders;
CREATE POLICY "orders: staff update status" ON public.orders
  FOR UPDATE USING (public.get_user_role() IN ('kitchen', 'admin'));

DROP POLICY IF EXISTS "order_items: staff read all" ON public.order_items;
CREATE POLICY "order_items: staff read all" ON public.order_items
  FOR SELECT USING (public.get_user_role() IN ('reception', 'kitchen', 'admin'));

DROP POLICY IF EXISTS "slot_locks: staff read" ON public.slot_locks;
CREATE POLICY "slot_locks: staff read" ON public.slot_locks
  FOR SELECT USING (public.get_user_role() IN ('reception', 'admin'));

-- Allow reception and admin to update room status/details
DROP POLICY IF EXISTS "rooms: reception/admin update status" ON public.rooms;
CREATE POLICY "rooms: reception/admin update status" ON public.rooms
  FOR UPDATE USING (public.get_user_role() IN ('reception', 'admin'))
  WITH CHECK (public.get_user_role() IN ('reception', 'admin'));
