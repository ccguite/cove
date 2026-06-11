# COVE — Architecture

## Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend Framework | Next.js 14 (React) | Renders all public pages (SSR/SSG for SEO) and all authenticated UI (booking flow, ordering, dashboard). Hosts API routes for server-side logic. |
| Styling | Vanilla CSS with CSS custom properties | Global design tokens (colours, spacing, typography), component-scoped styles. No Tailwind or CSS-in-JS. |
| Database | Supabase (PostgreSQL) | Single source of truth for all application data: users, bookings, orders, menu items, room definitions, blocked slots. |
| Auth | Supabase Auth (Phone OTP primary, Email OTP fallback) | Issues and verifies JWTs. Session tokens stored in secure HTTP-only cookies via Supabase SSR helpers. |
| File Storage | Supabase Storage | Stores all binary assets uploaded through the admin panel: menu item images and room/feature photography. |
| Realtime | Supabase Realtime (Postgres Changes) | Pushes live order and booking events to the staff/admin dashboard without polling. |
| Payments | Razorpay | Creates payment orders server-side, processes customer transactions (UPI, debit card, net banking), and sends webhook events on payment success or failure. |
| API Layer | Next.js API Routes (`/app/api/`) | Handles server-side operations that must not run in the browser: Razorpay order creation, Razorpay webhook verification, slot-lock logic, delivery radius pre-check. |
| Deployment | Vercel | Hosts the Next.js application. Provides edge CDN for static assets and serverless function execution for API routes. |
| Environment Config | Vercel Environment Variables | Stores all secrets: Supabase URL, Supabase anon key, Supabase service role key, Razorpay key ID, Razorpay key secret, Razorpay webhook secret. |

---

## System Boundaries

Each folder in the project owns a clearly defined responsibility. No folder's code should reach into another folder's concern directly.

```
cove/
├── app/                        # Next.js App Router root
│   ├── (public)/               # Unauthenticated marketing pages
│   │   ├── page.tsx            # Homepage
│   │   ├── menu/               # Public menu browser
│   │   ├── rooms/              # Husk & Haven info pages
│   │   └── features/           # Cat Café, Pool Table, Photobooth
│   ├── (auth)/                 # OTP login and verification flow
│   ├── (customer)/             # Authenticated customer pages
│   │   ├── book/               # Room booking flow
│   │   ├── order/              # Food ordering flow (takeaway + delivery)
│   │   └── account/            # Booking & order history
│   ├── (dashboard)/            # Internal staff + admin dashboard
│   │   └── dashboard/          # Nested under /dashboard prefix to prevent root page conflicts
│   │       ├── page.tsx        # Overview page
│   │       ├── orders/         # Live order management
│   │       ├── bookings/       # Booking overview
│   │       ├── menu/           # Menu management (admin only)
│   │       ├── slots/          # Manual slot blocking (admin only)
│   │       └── staff/          # Staff account management (admin only)
│   └── api/                    # Server-side API routes only
│       ├── razorpay/           # Create payment order, verify webhook
│       ├── bookings/           # Slot availability, slot-lock, confirm booking
│       └── orders/             # Delivery pre-check, confirm order
├── components/                 # Reusable UI components (no business logic)
│   ├── ui/                     # Primitive components (Button, Input, Modal)
│   └── shared/                 # Composite components (MenuCard, RoomCard, BookingSlot)
├── lib/                        # Pure business logic, no UI
│   ├── supabase/               # Supabase client initialisation (browser + server)
│   ├── booking/                # Slot validation, overlap detection, boundary checks
│   ├── delivery/               # Radius calculation logic
│   ├── razorpay/               # Order creation and HMAC signature verification
│   └── auth/                   # Session helpers, role-checking utilities
├── styles/                     # Global CSS, design tokens, typography
└── public/                     # Static assets (logo, icons, og-image)
```

**Boundary rules:**
- `app/api/` routes are the **only** place that uses the Supabase service role key. All browser-facing code uses the anon key with RLS enforcing access.
- `lib/` contains zero Next.js or React imports. It is framework-agnostic business logic.
- `components/` contains zero direct Supabase queries. Data is passed in as props or via React Context.
- `(dashboard)/` routes are protected by middleware that checks for a `staff` or `admin` role in the session. A `customer` role is rejected at the middleware layer, not inside the page component.

---

## Storage Model

### PostgreSQL (Supabase) — Relational Data

Everything that needs querying, filtering, joining, or transactional integrity lives here.

| Table | What It Stores |
|---|---|
| `users` | id, phone, email, name, role (`customer` / `staff` / `admin`), created_at |
| `rooms` | id, name (`Husk` / `Haven`), min_pax, max_pax, price_per_hour |
| `bookings` | id, user_id, room_id, date, start_time, duration_hours, guest_count, total_price, status (`pending_payment` / `confirmed`), razorpay_order_id, created_at |
| `booking_food_items` | id, booking_id, menu_item_id, quantity, unit_price (snapshot at time of order) |
| `orders` | id, user_id, type (`takeaway` / `delivery`), status (`placed` / `preparing` / `ready` / `dispatched` / `collected`), total_price, delivery_address, razorpay_order_id, created_at |
| `order_items` | id, order_id, menu_item_id, quantity, unit_price (snapshot at time of order) |
| `menu_categories` | id, name, type (`food` / `drink`), display_order |
| `menu_items` | id, category_id, name, description, price, image_url, is_available, is_seasonal, created_at |
| `blocked_slots` | id, room_id, date, start_time, duration_hours, reason, created_by (admin user id) |
| `slot_locks` | id, room_id, date, start_time, duration_hours, locked_at, expires_at (TTL: 10 minutes) |

> **Price snapshotting**: `unit_price` is stored on `booking_food_items` and `order_items` at the moment of checkout, not referenced live from `menu_items`. This ensures historical order totals remain accurate even if the admin later changes a price.

### Supabase Storage — Binary Files

Static and uploaded binary assets that are too large or too infrequently-changing for the database.

| Bucket | Contents | Access |
|---|---|---|
| `menu-images` | Item photos uploaded by admin via dashboard | Public read, authenticated write (admin only) |
| `room-photos` | Room and ambience photography | Public read, authenticated write (admin only) |
| `feature-photos` | Cat Café, Pool Table, Photobooth images | Public read, authenticated write (admin only) |

### Cache — No Dedicated Cache Layer (v1)

There is no Redis or external cache in v1. Next.js `fetch` caching and `revalidate` tags handle menu and room data caching at the framework level. Supabase Realtime removes the need for polling-based cache invalidation on the dashboard.

---

## Auth and Access Model

### Authentication Flow

1. Customer or staff enters their phone number.
2. Supabase Auth sends a one-time password (OTP) via SMS to that number.
3. User submits the OTP. Supabase verifies it and issues a signed JWT.
4. The JWT is stored in a secure HTTP-only cookie using Supabase's SSR Auth helpers (`@supabase/ssr`).
5. All subsequent requests include this cookie. Next.js middleware reads it server-side to determine identity and role.
6. On first OTP verification, if no `users` row exists for that phone number, a new row is automatically inserted with `role = 'customer'`.

### Roles and What They Can Do

| Role | Assigned By | Can Access |
|---|---|---|
| `customer` | Auto-assigned on first OTP login | Public pages, booking flow, food ordering, own account history |
| `staff` | Admin creates account and assigns role | All of the above + staff dashboard (orders, bookings, order status updates) |
| `admin` | Manually set in database by project owner | All of the above + full dashboard (menu management, slot blocking, revenue reports, staff management) |

### Row-Level Security (RLS)

Supabase RLS policies enforce data ownership at the database layer, not just in application code.

| Table | Policy |
|---|---|
| `bookings` | A `customer` can only SELECT rows where `user_id = auth.uid()`. Staff and admin can SELECT all rows. |
| `orders` | A `customer` can only SELECT rows where `user_id = auth.uid()`. Staff and admin can SELECT all rows. |
| `menu_items` | Anyone can SELECT. Only `admin` role can INSERT, UPDATE, DELETE. |
| `blocked_slots` | Only `admin` role can INSERT, UPDATE, DELETE. Staff and customers have no write access. |
| `users` | A user can only SELECT and UPDATE their own row. Only `admin` can SELECT all rows or change `role`. |

### Ownership Model

- A booking or order is **owned** by the `user_id` on the record.
- Payment confirmation is handled exclusively via a server-side Razorpay webhook (`/api/razorpay/webhook`). The webhook verifies the HMAC signature and only then sets `bookings.status = 'confirmed'` or `orders.status = 'placed'`. The client never self-confirms a payment.

---

## Background Tasks

There are no persistent background workers or cron jobs in v1. The following are the closest equivalents:

| Task | Mechanism |
|---|---|
| Payment confirmation | Razorpay webhook → `/api/razorpay/webhook` → Supabase update |
| Real-time order alerts to staff dashboard | Supabase Realtime subscription on `orders` and `bookings` tables — pushes `INSERT` events to connected dashboard clients |
| Slot lock expiry | `slot_locks` rows have an `expires_at` timestamp. A Supabase database function (Postgres `pg_cron` extension) deletes expired locks every 5 minutes. This keeps the table clean without a Node.js worker. |

> **No AI/ML models are used in v1.** No recommendation engine, no image recognition, no chatbot.

---

## Invariants

These are rules the codebase must never violate. If a proposed change would break one of these, the change must be redesigned.

### 1. A booking can never be confirmed without a verified Razorpay payment

`bookings.status` must only be set to `'confirmed'` by the server-side Razorpay webhook handler (`/api/razorpay/webhook`), after the HMAC signature has been verified against `RAZORPAY_WEBHOOK_SECRET`. No client-side code, no form submission, and no direct Supabase client call from the browser may set this status. This prevents fraudulent bookings by bypassing payment.

### 2. A room slot may never be double-booked

Before creating a booking, the API must check both the `bookings` table (confirmed bookings) and the `slot_locks` table (in-progress checkouts) for the same `room_id`, `date`, and overlapping time window. A new booking is only permitted if both checks return zero conflicts. This check must happen inside a Postgres transaction to prevent a race condition between concurrent requests.

### 3. No booking may end after 23:00 (11PM)

The constraint `start_time + duration_hours * INTERVAL '1 hour' <= '23:00'::time` must be enforced in two places: in the client UI (disabling invalid duration options) and in the server-side API route before the slot is locked. The UI check is for UX. The API check is the authoritative guard. A booking that violates this constraint must be rejected with a `400` error even if the client somehow submits it.

### 4. Price must always be calculated server-side

The total price for a booking (`room.price_per_hour × duration_hours`) and for a food order (sum of `menu_item.price × quantity` for each item) must be calculated in the API route at checkout time by reading live prices from the database. The client must never send a price to the server and have the server trust it. The Razorpay order amount is always set from the server-calculated total, never from a client-supplied figure.

### 5. A delivery order may never proceed to payment before a radius check passes

The `/api/orders/create` route must validate that the delivery address falls within the 5km radius before creating a Razorpay order. A Razorpay order must not exist for a delivery that has not passed this check. The radius check logic lives exclusively in `lib/delivery/` and is called only from the API route — never from the browser directly.

### 6. Item prices must be snapshotted at the time of order

When inserting rows into `order_items` or `booking_food_items`, the `unit_price` column must be populated from the live `menu_items.price` at the moment of checkout, not referenced by foreign key. This ensures that a future admin price change does not retroactively alter the total on a historical order, and that revenue reports remain accurate.

### 7. Only admins may write to `menu_items`, `blocked_slots`, and `users.role`

These tables carry privileged data. Write access (INSERT, UPDATE, DELETE) must be restricted to the `admin` role through both Supabase RLS policies and Next.js middleware on dashboard API routes. Application code that performs writes to these tables must first assert `session.user.role === 'admin'` server-side, independent of any client-side role check.
