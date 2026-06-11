-- Enable RLS on all tables
alter table public.users           enable row level security;
alter table public.rooms           enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items      enable row level security;
alter table public.bookings        enable row level security;
alter table public.booking_food_items enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.slot_locks      enable row level security;
alter table public.blocked_slots   enable row level security;

-- Helper function: get the role of the authenticated user
create or replace function public.get_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.users where id = auth.uid();
$$;

-- =====================
-- users table policies
-- =====================
-- Anyone can read their own row
create policy "users: read own row"
  on public.users for select
  using (id = auth.uid());

-- Admin can read all rows
create policy "users: admin read all"
  on public.users for select
  using (public.get_user_role() = 'admin');

-- A user can update their own row (but not change role)
create policy "users: update own row"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.users where id = auth.uid()));

-- Admin can update any row (including role changes)
create policy "users: admin update all"
  on public.users for update
  using (public.get_user_role() = 'admin');

-- Insert is handled by the trigger using service role
-- No INSERT policy for regular users

-- =====================
-- rooms table policies
-- =====================
-- Public read — anyone can see room details
create policy "rooms: public read"
  on public.rooms for select
  using (true);

-- Only admin can modify rooms
create policy "rooms: admin write"
  on public.rooms for all
  using (public.get_user_role() = 'admin');

-- =====================
-- menu_categories policies
-- =====================
create policy "menu_categories: public read"
  on public.menu_categories for select
  using (true);

create policy "menu_categories: admin write"
  on public.menu_categories for all
  using (public.get_user_role() = 'admin');

-- =====================
-- menu_items policies
-- =====================
create policy "menu_items: public read"
  on public.menu_items for select
  using (true);

create policy "menu_items: admin write"
  on public.menu_items for all
  using (public.get_user_role() = 'admin');

-- =====================
-- bookings policies
-- =====================
-- Customers see only their own bookings
create policy "bookings: customer read own"
  on public.bookings for select
  using (user_id = auth.uid());

-- Staff and admin see all bookings
create policy "bookings: staff read all"
  on public.bookings for select
  using (public.get_user_role() in ('staff', 'admin'));

-- Customers can insert their own bookings (API routes handle this via service role)
-- No direct insert from browser; all writes go through API routes

-- =====================
-- booking_food_items policies
-- =====================
create policy "booking_food_items: customer read own"
  on public.booking_food_items for select
  using (
    booking_id in (
      select id from public.bookings where user_id = auth.uid()
    )
  );

create policy "booking_food_items: staff read all"
  on public.booking_food_items for select
  using (public.get_user_role() in ('staff', 'admin'));

-- =====================
-- orders policies
-- =====================
create policy "orders: customer read own"
  on public.orders for select
  using (user_id = auth.uid());

create policy "orders: staff read all"
  on public.orders for select
  using (public.get_user_role() in ('staff', 'admin'));

-- Staff and admin can update order status
create policy "orders: staff update status"
  on public.orders for update
  using (public.get_user_role() in ('staff', 'admin'));

-- =====================
-- order_items policies
-- =====================
create policy "order_items: customer read own"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders where user_id = auth.uid()
    )
  );

create policy "order_items: staff read all"
  on public.order_items for select
  using (public.get_user_role() in ('staff', 'admin'));

-- =====================
-- slot_locks policies
-- =====================
-- Staff and admin can read slot locks
create policy "slot_locks: staff read"
  on public.slot_locks for select
  using (public.get_user_role() in ('staff', 'admin'));

-- All authenticated users can read slot locks
create policy "slot_locks: authenticated read"
  on public.slot_locks for select
  using (auth.uid() is not null);

-- =====================
-- blocked_slots policies
-- =====================
-- All authenticated users can read blocked slots
create policy "blocked_slots: authenticated read"
  on public.blocked_slots for select
  using (auth.uid() is not null);

-- Only admin can insert/update/delete blocked slots
create policy "blocked_slots: admin write"
  on public.blocked_slots for all
  using (public.get_user_role() = 'admin');

-- =====================
-- Auto-create user row on first login
-- =====================
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, phone, email, role)
  values (
    new.id,
    new.phone,
    new.email,
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();
