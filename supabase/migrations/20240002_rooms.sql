create table public.rooms (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique,
  slug             text not null unique,
  min_pax          integer not null,
  max_pax          integer not null,
  price_per_hour   integer not null,
  description      text,
  created_at       timestamptz not null default now(),
  constraint rooms_pax_order check (min_pax <= max_pax),
  constraint rooms_price_positive check (price_per_hour > 0)
);

comment on table public.rooms is 'The two bookable rooms: Husk (Couple Room) and Haven (Group Room).';
