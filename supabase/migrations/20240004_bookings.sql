create table public.slot_locks (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid not null references public.rooms(id) on delete cascade,
  date            date not null,
  start_time      time not null,
  duration_hours  integer not null check (duration_hours between 1 and 5),
  locked_at       timestamptz not null default now(),
  expires_at      timestamptz not null default (now() + interval '10 minutes'),
  locked_by       uuid references public.users(id) on delete set null
);

create table public.blocked_slots (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid not null references public.rooms(id) on delete cascade,
  date            date not null,
  start_time      time not null,
  duration_hours  integer not null check (duration_hours >= 1),
  reason          text,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete restrict,
  room_id             uuid not null references public.rooms(id) on delete restrict,
  date                date not null,
  start_time          time not null,
  duration_hours      integer not null check (duration_hours between 1 and 5),
  guest_count         integer not null check (guest_count >= 1),
  total_price         integer not null check (total_price > 0),
  status              text not null default 'pending_payment'
                        check (status in ('pending_payment', 'confirmed')),
  razorpay_order_id   text unique,
  created_at          timestamptz not null default now()
);

create table public.booking_food_items (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.bookings(id) on delete cascade,
  menu_item_id    uuid not null references public.menu_items(id) on delete restrict,
  quantity        integer not null check (quantity >= 1),
  unit_price      integer not null check (unit_price > 0)
);

comment on table public.slot_locks          is 'Temporary holds on a room slot during active checkout. TTL: 10 minutes. Cleaned by pg_cron.';
comment on table public.blocked_slots       is 'Admin-created manual blocks on room slots. Appear as unavailable to customers.';
comment on table public.bookings            is 'Confirmed and pending room bookings. Status set to confirmed only by Razorpay webhook.';
comment on table public.booking_food_items  is 'Food pre-orders attached to a booking. unit_price is snapshotted at checkout time.';
