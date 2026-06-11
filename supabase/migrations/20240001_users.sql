create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  phone        text unique,
  email        text unique,
  name         text,
  role         text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at   timestamptz not null default now()
);

comment on table public.users is 'Application user profiles, linked to Supabase Auth. Role controls dashboard access.';
