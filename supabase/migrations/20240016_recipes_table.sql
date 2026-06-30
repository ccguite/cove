-- ============================================================
-- Migration 20240016: Recipes Table
-- Stores kitchen recipes linked to menu items (one per item).
-- ============================================================

create table public.recipes (
  id            uuid primary key default gen_random_uuid(),
  menu_item_id  uuid not null unique references public.menu_items(id) on delete cascade,
  prep_time     text,
  servings      text,
  difficulty    text check (difficulty in ('Easy', 'Medium', 'Hard')),
  ingredients   text,
  method        text,
  allergens     text,
  notes         text,
  updated_at    timestamptz not null default now()
);

comment on table public.recipes is
  'Kitchen recipes for menu items. One row per menu item. Only editable by admin.';

-- ── RLS ──────────────────────────────────────────────────────
alter table public.recipes enable row level security;

-- Admin and kitchen staff can read all recipes
create policy "recipes: staff read"
  on public.recipes for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('admin', 'kitchen', 'reception')
    )
  );

-- Only admin can write
create policy "recipes: admin write"
  on public.recipes for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- ── Index ─────────────────────────────────────────────────────
create index idx_recipes_menu_item_id on public.recipes(menu_item_id);

-- ── Auto-update updated_at ────────────────────────────────────
create or replace function public.set_recipes_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_recipes_updated_at
  before update on public.recipes
  for each row execute function public.set_recipes_updated_at();
