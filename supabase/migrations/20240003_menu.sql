create table public.menu_categories (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  type           text not null check (type in ('food', 'drink')),
  display_order  integer not null default 0
);

create table public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.menu_categories(id) on delete restrict,
  name          text not null,
  description   text,
  price         integer not null,
  image_url     text,
  is_available  boolean not null default true,
  is_seasonal   boolean not null default false,
  created_at    timestamptz not null default now(),
  constraint menu_items_price_positive check (price > 0)
);

comment on table public.menu_categories is 'Top-level menu groupings (e.g. Hot Coffees, Burgers). Type is food or drink.';
comment on table public.menu_items     is 'Individual menu items. Price stored in rupees (integer). is_available=false means sold out.';
