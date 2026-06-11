create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete restrict,
  type                text not null check (type in ('takeaway', 'delivery')),
  status              text not null default 'placed'
                        check (status in ('placed', 'preparing', 'ready', 'dispatched', 'collected')),
  total_price         integer not null check (total_price > 0),
  delivery_address    text,
  razorpay_order_id   text unique,
  created_at          timestamptz not null default now(),
  constraint orders_delivery_requires_address
    check (type != 'delivery' or delivery_address is not null)
);

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  menu_item_id  uuid not null references public.menu_items(id) on delete restrict,
  quantity      integer not null check (quantity >= 1),
  unit_price    integer not null check (unit_price > 0)
);

comment on table public.orders      is 'Standalone food orders (takeaway or delivery). Delivery requires a delivery_address.';
comment on table public.order_items is 'Line items for a food order. unit_price is snapshotted at checkout time.';
