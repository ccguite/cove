# Spec: Unit 2 — Supabase Project & Database Schema

## Goal

Create the Supabase project, define and run all 10 database table migrations in dependency order, initialise both Supabase clients in the Next.js codebase, and seed the `rooms` and `menu_categories` tables with their static data so that subsequent units can query real records immediately.

---

## Design

### Structural Decisions

- All migrations are written as plain `.sql` files under `supabase/migrations/`. They are run in filename-sorted order. Each file covers one logical group of tables.
- The two Supabase clients live exclusively in `lib/supabase/`. Nothing outside `lib/supabase/` initialises a Supabase client directly.
- The browser client uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The server client uses `SUPABASE_SERVICE_ROLE_KEY`. These two clients must never be swapped.
- RLS policies are **not** written in this unit — they are implemented in Unit 3. For now, tables exist with RLS disabled (default Supabase behaviour on new tables).
- Seed data is applied via a separate `supabase/seed.sql` file, not in the migration files. Migrations define schema only.
- No UI is added in this unit. The visible result is confirmed in the Supabase dashboard and via a test query logged to the browser console from the proof-of-life page.

### What Gets Seeded

**`rooms` table — 2 rows:**
| name | slug | min_pax | max_pax | price_per_hour | description |
|---|---|---|---|---|---|
| Husk | husk | 1 | 2 | 599 | The Couple Room — an intimate space for two |
| Haven | haven | 3 | 8 | 1499 | The Group Room — a social space for 3 to 8 guests |

**`menu_categories` table — 8 rows (in display order):**
| name | type | display_order |
|---|---|---|
| Hot Coffees | drink | 1 |
| Cold Coffees | drink | 2 |
| Shakes | drink | 3 |
| Iced Tea | drink | 4 |
| Signature Drinks | drink | 5 |
| Cakes & Pastries | food | 6 |
| Croffles | food | 7 |
| Sandwiches | food | 8 |
| Fries | food | 9 |
| Burgers | food | 10 |
| Snacks | food | 11 |

---

## Implementation

### 3.1 Create the Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Name the project `cove`.
3. Set a strong database password and save it securely. This is the only time Supabase shows it.
4. Select the region closest to Aizawl — `ap-south-1` (Mumbai) is the correct choice for India.
5. Wait for the project to provision (approximately 1–2 minutes).

After the project is ready, navigate to **Project Settings → API** and collect:
- `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key (under "Project API keys", click reveal) → this is `SUPABASE_SERVICE_ROLE_KEY`

Add all three values to `.env.local` and the variable names (without values) to `.env.example`.

---

### 3.2 Install Supabase Packages

Run in the project root:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

| Package | Version | Role |
|---|---|---|
| `@supabase/supabase-js` | latest | Core Supabase client library |
| `@supabase/ssr` | latest | SSR-compatible session handling for Next.js App Router |

---

### 3.3 Migration Files

Create the `supabase/migrations/` directory at the project root. Write one migration file per logical group. Files are named with a timestamp prefix so they sort and run in order.

#### File 1: `supabase/migrations/20240001_users.sql`

```sql
create table public.users (
  id           uuid primary key references auth.users(id) on delete cascade,
  phone        text unique,
  email        text unique,
  name         text,
  role         text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at   timestamptz not null default now()
);

comment on table public.users is 'Application user profiles, linked to Supabase Auth. Role controls dashboard access.';
```

> `id` references `auth.users(id)` — Supabase's internal auth table. When a user is deleted from auth, their `users` row is also deleted via `on delete cascade`.

#### File 2: `supabase/migrations/20240002_rooms.sql`

```sql
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
```

#### File 3: `supabase/migrations/20240003_menu.sql`

```sql
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
```

> Prices are stored as integers (rupees, not paise). ₹599 is stored as `599`. This avoids floating-point arithmetic on currency values.

#### File 4: `supabase/migrations/20240004_bookings.sql`

```sql
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
```

#### File 5: `supabase/migrations/20240005_orders.sql`

```sql
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
```

#### File 6: `supabase/migrations/20240006_indexes.sql`

Create indexes for the most common query patterns:

```sql
-- Booking availability checks (most performance-critical query)
create index idx_bookings_room_date        on public.bookings(room_id, date);
create index idx_slot_locks_room_date      on public.slot_locks(room_id, date);
create index idx_blocked_slots_room_date   on public.blocked_slots(room_id, date);

-- Dashboard queries
create index idx_bookings_status           on public.bookings(status);
create index idx_bookings_user_id          on public.bookings(user_id);
create index idx_orders_status             on public.orders(status);
create index idx_orders_user_id            on public.orders(user_id);
create index idx_orders_created_at         on public.orders(created_at desc);

-- Menu queries
create index idx_menu_items_category_id    on public.menu_items(category_id);
create index idx_menu_items_is_available   on public.menu_items(is_available);

-- Slot lock expiry cleanup
create index idx_slot_locks_expires_at     on public.slot_locks(expires_at);
```

#### File 7: `supabase/migrations/20240007_pg_cron.sql`

Enable `pg_cron` to automatically clean up expired slot locks every 5 minutes:

```sql
-- Enable the pg_cron extension (must be done as superuser via Supabase dashboard
-- Extensions tab, then this SQL registers the job)
select cron.schedule(
  'delete-expired-slot-locks',
  '*/5 * * * *',
  $$
    delete from public.slot_locks
    where expires_at < now();
  $$
);

comment on table public.slot_locks is
  'Temporary holds on a room slot during active checkout. TTL: 10 minutes. Cleaned every 5 minutes by pg_cron job ''delete-expired-slot-locks''.';
```

> **Important**: Before running this migration, enable the `pg_cron` extension in the Supabase dashboard: **Database → Extensions → search "pg_cron" → Enable**. If `pg_cron` is not enabled, this migration will fail.

---

### 3.4 Seed File — `supabase/seed.sql`

Create `supabase/seed.sql` at the project root. This file is run manually after migrations via the Supabase SQL editor or CLI. It is idempotent — running it twice does not create duplicate rows.

```sql
-- Rooms
insert into public.rooms (name, slug, min_pax, max_pax, price_per_hour, description)
values
  ('Husk',  'husk',  1, 2, 599,  'The Couple Room — an intimate space designed for two.'),
  ('Haven', 'haven', 3, 8, 1499, 'The Group Room — a social space for 3 to 8 guests.')
on conflict (slug) do nothing;

-- Menu categories
insert into public.menu_categories (name, type, display_order)
values
  ('Hot Coffees',      'drink', 1),
  ('Cold Coffees',     'drink', 2),
  ('Shakes',           'drink', 3),
  ('Iced Tea',         'drink', 4),
  ('Signature Drinks', 'drink', 5),
  ('Cakes & Pastries', 'food',  6),
  ('Croffles',         'food',  7),
  ('Sandwiches',       'food',  8),
  ('Fries',            'food',  9),
  ('Burgers',          'food',  10),
  ('Snacks',           'food',  11)
on conflict (name) do nothing;
```

**How to run the seed:**
1. Go to Supabase dashboard → **SQL Editor**
2. Paste the contents of `supabase/seed.sql`
3. Click **Run**

---

### 3.5 Supabase Client — Browser (`lib/supabase/browserClient.ts`)

Create `lib/supabase/browserClient.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Rules for this client:**
- Uses the anon key — safe to expose to the browser
- Used in `'use client'` components and Realtime subscriptions
- Never used in API routes or Server Components
- Call `createSupabaseBrowserClient()` per component/hook — do not export a singleton instance, as the SSR helpers manage session state per request

---

### 3.6 Supabase Client — Server (`lib/supabase/serverClient.ts`)

Create `lib/supabase/serverClient.ts`:

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {}
        },
      },
    }
  );
}

export function createSupabaseServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
      },
    }
  );
}
```

**Two functions, two purposes:**
- `createSupabaseServerClient()` — uses the anon key with cookie-based session. Used in Server Components and API routes that need to read the current user's session.
- `createSupabaseServiceClient()` — uses the service role key. Bypasses RLS. Used **only** in API routes for privileged writes (e.g., Razorpay webhook confirming a booking). Never used in Server Components that render user-facing pages.

---

### 3.7 Supabase Types — `lib/supabase/types.ts`

Create `lib/supabase/types.ts`. This file defines TypeScript types that mirror the database schema. These types are used everywhere in the codebase instead of writing raw object shapes.

```ts
export type UserRole = 'customer' | 'staff' | 'admin';

export type User = {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: UserRole;
  created_at: string;
};

export type Room = {
  id: string;
  name: string;
  slug: string;
  min_pax: number;
  max_pax: number;
  price_per_hour: number;
  description: string | null;
  created_at: string;
};

export type MenuCategoryType = 'food' | 'drink';

export type MenuCategory = {
  id: string;
  name: string;
  type: MenuCategoryType;
  display_order: number;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_seasonal: boolean;
  created_at: string;
};

export type BookingStatus = 'pending_payment' | 'confirmed';

export type Booking = {
  id: string;
  user_id: string;
  room_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  guest_count: number;
  total_price: number;
  status: BookingStatus;
  razorpay_order_id: string | null;
  created_at: string;
};

export type BookingFoodItem = {
  id: string;
  booking_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
};

export type OrderType = 'takeaway' | 'delivery';
export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'dispatched' | 'collected';

export type Order = {
  id: string;
  user_id: string;
  type: OrderType;
  status: OrderStatus;
  total_price: number;
  delivery_address: string | null;
  razorpay_order_id: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
};

export type SlotLock = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  locked_at: string;
  expires_at: string;
  locked_by: string | null;
};

export type BlockedSlot = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;
};
```

---

### 3.8 Update Proof-of-Life Page (Test Query)

Update `app/page.tsx` to add a server-side test query that fetches the two rooms from Supabase and logs them. This is the visible confirmation that the database connection works.

- Import `createSupabaseServerClient` from `lib/supabase/serverClient`
- In the `async` page component, call `supabase.from('rooms').select('*')`
- Render the room names on the page below the existing proof-of-life content
- If the query returns an error, render the error message instead

This test query is temporary. It will be replaced in Unit 4 when the real homepage is built.

---

### 3.9 Update `.env.local` and `.env.example`

`.env.local` (actual values, not committed):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Razorpay (added in Unit 9)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

`.env.example` (variable names only, committed):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

---

## Dependencies

Install via:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

| Package | Role |
|---|---|
| `@supabase/supabase-js` | Core Supabase client — database queries, auth, storage, realtime |
| `@supabase/ssr` | SSR-safe session management for Next.js App Router using HTTP-only cookies |

No other packages are needed for this unit.

---

## Verification Checklist

Complete every item before marking Unit 2 done and starting Unit 3.

### Supabase Dashboard
- [ ] Supabase project `cove` is provisioned and accessible at its dashboard URL
- [ ] All 10 tables exist in the **Table Editor**: `users`, `rooms`, `bookings`, `booking_food_items`, `orders`, `order_items`, `menu_categories`, `menu_items`, `blocked_slots`, `slot_locks`
- [ ] Each table's columns match the schema defined in section 3.3 (check column names, types, nullability, and defaults)
- [ ] `rooms` table contains exactly 2 rows: Husk and Haven (verify in Table Editor)
- [ ] `menu_categories` table contains exactly 11 rows (5 drink + 6 food categories — verify in Table Editor)
- [ ] All database constraints are present (verify in **Database → Tables → select table → Constraints** tab): `check` constraints on `role`, `status`, `type`, `price`, `pax` columns
- [ ] `pg_cron` extension is enabled (**Database → Extensions**)
- [ ] The cron job `delete-expired-slot-locks` is registered (verify in **Database → Functions** or SQL Editor: `select * from cron.job;`)

### Indexes
- [ ] Run `select indexname, tablename from pg_indexes where schemaname = 'public' order by tablename;` in the SQL Editor and confirm all 11 indexes from migration 20240006 are present

### Environment Variables
- [ ] `.env.local` contains real values for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `.env.example` contains variable names without values
- [ ] `.gitignore` still contains `.env.local` (has not been accidentally removed)

### Supabase Clients
- [ ] `lib/supabase/browserClient.ts` exists and exports `createSupabaseBrowserClient`
- [ ] `lib/supabase/serverClient.ts` exists and exports both `createSupabaseServerClient` and `createSupabaseServiceClient`
- [ ] `lib/supabase/types.ts` exists and exports all 14 types listed in section 3.7
- [ ] `npx tsc --noEmit` runs without errors after adding the new files

### Database Connection Test
- [ ] `npm run dev` starts without errors
- [ ] The proof-of-life page at `localhost:3000` renders the two room names ("Husk" and "Haven") fetched from Supabase
- [ ] No Supabase error message is shown on the page (the query succeeded)
- [ ] DevTools → Network shows a request to `your-project-id.supabase.co` returning a `200` response

### Architecture Compliance
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not referenced in any file under `app/(public)/`, `components/`, or any file that runs in the browser
- [ ] No Supabase client is initialised outside of `lib/supabase/`
- [ ] No hardcoded table names exist anywhere — they will only appear in `lib/` service files (which don't exist yet, but this rule applies going forward)

### Next Step
- [ ] State the first task of Unit 3: write RLS policies for all 10 tables and implement the OTP login page
