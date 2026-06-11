# COVE — Build Order

Each unit produces one visible, testable result within a single system boundary. Dependencies are listed only when they must exist before the unit can start. Units with no standalone visible result have been merged with their adjacent unit.

---

## Unit 1 — Project Scaffold & Design System

**Builds:**
Next.js 14 project initialised with TypeScript and App Router. Global CSS design token file (`styles/tokens.css`) wired up with all colour, typography, spacing, border-radius, and shadow tokens from `ui-context.md`. Google Fonts loaded (Playfair Display + Inter). A single visible `Hello COVE` homepage that proves the design system is live — correct background colour, correct font rendering, correct token values in DevTools.

**What you see when done:**
Browser shows the cream background (`#FEF9F1`), Playfair Display heading in espresso brown, Inter body text — all driven by CSS custom properties.

**Dependencies:** None. This is the starting point.

---

## Unit 2 — Supabase Project & Database Schema

**Builds:**
Supabase project created. All 10 tables created via SQL migrations: `users`, `rooms`, `bookings`, `booking_food_items`, `orders`, `order_items`, `menu_categories`, `menu_items`, `blocked_slots`, `slot_locks`. Both Supabase clients initialised in `lib/supabase/browserClient.ts` and `lib/supabase/serverClient.ts`. The two Husk and Haven room rows seeded into the `rooms` table. All menu categories seeded into `menu_categories`. Environment variables added to `.env.local` and `.env.example`.

**What you see when done:**
Supabase dashboard shows all tables with correct columns. A test query from the browser client returns the two room rows without error.

**Dependencies:** Unit 1 (project must exist to install Supabase packages into).

---

## Unit 3 — RLS & Auth Middleware + OTP Login

**Builds:**
RLS policies written and enabled for all tables as specified in `architecture.md`. Next.js middleware file (`middleware.ts`) created — protects `/(customer)/*` (requires any session), `/(dashboard)/*` (requires `staff` or `admin` role). Phone OTP login page and OTP verification page built under `app/(auth)/` with full UI and Supabase Auth wired up. On first successful OTP verification, a row is inserted into `users` with `role = 'customer'`.

**What you see when done:**
Visiting `/dashboard` without a session redirects to `/login`. Entering a phone number sends an OTP (Supabase test mode), verifying it creates a session and a `users` row, and redirects to the homepage as an authenticated customer.

**Dependencies:** Unit 2 (Supabase clients and `users` table must exist).

---

## Unit 4 — Homepage

**Builds:**
Full public homepage at `app/(public)/page.tsx`. Sections: hero (full-bleed image, headline, CTA buttons for Book and Order), About COVE (one paragraph, brand tone), Rooms preview (Husk & Haven cards with name, capacity, price, Book Now CTA), Features preview (Cat Café, Pool Table, Photobooth cards), Menu teaser (3–4 featured items), Footer (address, hours, social links). All sections use design tokens. Page has correct `<title>`, meta description, single `<h1>`, and semantic HTML.

**What you see when done:**
A fully designed, photography-forward homepage that matches the Seoul Serenity aesthetic. Passes basic SEO checks (title, meta, h1, semantic structure).

**Dependencies:** Unit 1 (design system tokens must be live).

---

## Unit 5 — Public Rooms Page

**Builds:**
Rooms page at `app/(public)/rooms/page.tsx` and individual room detail pages at `app/(public)/rooms/[slug]/page.tsx` for Husk and Haven. Each page shows: room name, branded description, capacity (min/max pax), price per hour, operating hours, photo gallery, and a prominent "Book Now" CTA. Room data is fetched server-side from the `rooms` table. Pages are statically generated (SSG) and SEO-optimised.

**What you see when done:**
Two distinct, fully designed room pages accessible at `/rooms/husk` and `/rooms/haven`, each with real data from Supabase. "Book Now" button is visible (not yet wired to a booking flow).

**Dependencies:** Unit 2 (rooms table must have Husk/Haven rows), Unit 4 (nav and footer components exist to reuse).

---

## Unit 6 — Public Menu Page

**Builds:**
Menu page at `app/(public)/menu/page.tsx`. Displays all food and drink categories with items fetched server-side from `menu_items` joined to `menu_categories`. Items grouped by category (Food: Cakes & Pastries, Croffles, Sandwiches, Fries, Burgers, Snacks; Drinks: Hot Coffees, Cold Coffees, Shakes, Iced Tea, Signature Drinks). Sold-out items render in a visually distinct greyed-out state. Seasonal items show a badge. A sample set of 10–15 menu items is seeded into the database for this unit. Page is SSR with `revalidate` tag. SEO-optimised.

**What you see when done:**
A fully browsable menu page with categorised items, sold-out states, seasonal badges, and real data from Supabase.

**Dependencies:** Unit 2 (`menu_categories` and `menu_items` tables and seed data must exist).

---

## Unit 7 — Features Page (Cat Café, Pool Table, Photobooth)

**Builds:**
Features page at `app/(public)/features/page.tsx` with three sections: Cat Café, Pool Table, Photobooth. Each section has a heading, description, walk-in info (no booking required notice), pricing note, and photo. Static content — no database queries. Statically generated and SEO-optimised.

**What you see when done:**
A single scrollable features page showcasing all three walk-in experiences, consistent with the homepage aesthetic.

**Dependencies:** Unit 4 (nav and footer components must exist).

---

## Unit 8 — Booking Slot Validation Logic + Tests

**Builds:**
Pure business logic in `lib/booking/slotValidator.ts` with full test coverage in `lib/booking/slotValidator.test.ts`. Functions: `getAvailableSlots(roomId, date)` — returns all hourly start times from 10AM to 10PM filtered against confirmed bookings and active slot locks; `validateBookingBoundaries(startTime, durationHours)` — enforces the 11PM cutoff and 1–5 hour range; `validateGuestCount(roomId, guestCount)` — enforces Husk max 2 and Haven min 3 / max 8; `checkSlotConflict(roomId, date, startTime, durationHours)` — checks `bookings` and `slot_locks` for overlaps.

**What you see when done:**
`npx vitest` runs and all tests pass. No UI change — merged with Unit 9's flow which provides the visible result.

**Dependencies:** Unit 2 (Supabase server client and `bookings`, `slot_locks`, `rooms` tables must exist).

---

## Unit 9 — Room Booking Flow (Customer UI + API + Payment)

**Builds:**
Complete multi-step room booking flow at `app/(customer)/book/`. Steps: (1) room selection, (2) date picker → start time selector showing available/unavailable slots in real time → duration selector with 11PM cutoff enforced, (3) guest count input with per-room validation, (4) optional food pre-order browser (menu items selectable with quantity), (5) order summary with server-calculated total. API routes: `POST /api/bookings/lock` (creates a slot lock row), `POST /api/bookings/create` (validates all rules, calculates total price, creates Razorpay order). Middleware protects the route — unauthenticated users are redirected to OTP login first. Razorpay checkout modal wired up. Webhook handler at `POST /api/razorpay/webhook` verifies HMAC signature, sets `bookings.status = 'confirmed'`, removes the slot lock, inserts `booking_food_items` rows. `lib/razorpay/webhookVerifier.ts` and `lib/razorpay/orderCreator.ts` built with tests for HMAC verification. Booking confirmation page at `app/(customer)/book/confirmation/`.

**What you see when done:**
End-to-end room booking: select room → pick slot → add guests → pre-order food → pay via Razorpay → see confirmation page. `bookings.status = 'confirmed'` in Supabase. Slot-lock rows created during checkout and removed on confirmation.

**Dependencies:** Unit 3 (auth and middleware), Unit 6 (menu items for pre-order step), Unit 8 (slot validation logic).

---

## Unit 10 — Delivery Radius Logic + Food Order Flow (UI + API + Payment)

**Builds:**
`lib/delivery/radiusCheck.ts` with test in `lib/delivery/radiusCheck.test.ts` — hardcoded COVE GPS coordinates, haversine distance calculation, returns `true` if within 5km. Standalone food ordering flow at `app/(customer)/order/` — steps: (1) order type selector (Takeaway / Delivery), (2) menu browser with cart (add/remove items, running total), (3) if Delivery: address input → `POST /api/orders/validate-address` calls `radiusCheck` and returns pass/fail before showing the payment step, (4) order summary. API routes: `POST /api/orders/validate-address`, `POST /api/orders/create` (validates ₹299 minimum for delivery, calculates server-side total, creates Razorpay order). Razorpay webhook extended to handle food order confirmation: sets `orders.status = 'placed'`, inserts `order_items` rows. Order confirmation page shown after payment.

**What you see when done:**
Customer can place a takeaway or delivery food order end-to-end. Out-of-radius address is blocked before payment. Delivery order below ₹299 cannot proceed. Payment completes → `orders.status = 'placed'` in Supabase.

**Dependencies:** Unit 9 (Razorpay webhook handler must exist to extend), Unit 6 (menu items must exist).

---

## Unit 11 — Customer Account (Booking & Order History)

**Builds:**
Customer account page at `app/(customer)/account/`. Two tabs: Bookings and Orders. Bookings tab shows all confirmed bookings for the logged-in user (room name, date, time, duration, guests, pre-ordered food, total paid, status). Orders tab shows all food orders (type, items, total, status). Data fetched server-side using the authenticated user's `id` — RLS ensures customers only see their own records. Basic profile section (name, phone number). Empty states for no history.

**What you see when done:**
A logged-in customer sees their full booking and order history, correctly filtered to their account only.

**Dependencies:** Unit 9 and Unit 10 (confirmed bookings and placed orders must exist to display).

---

## Unit 12 — Staff Dashboard (Orders, Bookings & Real-time Notifications)

**Builds:**
Dashboard shell at `app/(dashboard)/layout.tsx` with sidebar navigation (Orders, Bookings, and admin-only sections shown by role). Middleware enforces staff/admin-only access. Orders page at `app/(dashboard)/orders/` showing all active food orders with inline status update buttons (Preparing → Ready → Out for Delivery / Ready for Pickup). Bookings page at `app/(dashboard)/bookings/` showing today's confirmed room bookings with pre-ordered food items listed. Supabase Realtime subscription on `orders` and `bookings` tables — new `INSERT` events trigger a toast notification and audio chime without a page refresh.

**What you see when done:**
A staff member sees live orders and bookings. Placing a new food order in another tab triggers the notification sound and toast on the dashboard immediately. Staff can update order status via the UI.

**Dependencies:** Unit 3 (auth and role middleware), Unit 9 and Unit 10 (bookings and orders must exist as real data).

---

## Unit 13 — Admin: Menu Management

**Builds:**
Admin-only menu management section at `app/(dashboard)/menu/`. Lists all menu items grouped by category. Actions per item: Edit (name, description, price, image), Toggle sold-out status, Delete. Add new item form with image upload to Supabase Storage `menu-images` bucket, seasonal toggle. All write operations assert `admin` role server-side. Changes invalidate the `revalidate` tag on the public menu page — changes are immediately visible on `/menu` without a redeploy.

**What you see when done:**
Admin adds a new item with a photo → it appears immediately on the public menu. Admin marks an item as sold out → it goes greyed-out on the public menu. Admin deletes an item → it disappears from the public menu.

**Dependencies:** Unit 12 (dashboard shell must exist), Unit 6 (public menu page must exist to validate changes appear there).

---

## Unit 14 — Admin: Manual Slot Blocking & Staff Account Management

**Builds:**
Two admin-only dashboard sections. **Slot blocking** at `app/(dashboard)/slots/`: calendar view of both rooms showing confirmed bookings and manually blocked slots. Admin can block a date/time range for a room with a reason, and unblock previously blocked slots. Blocked slots appear as unavailable in the customer booking flow. **Staff management** at `app/(dashboard)/staff/`: lists all users with `staff` or `admin` role. Admin can create a new staff account (phone + name), and change an existing user's role. All writes assert `admin` role server-side.

**What you see when done:**
Admin blocks a room slot → the slot is unavailable in the customer booking UI. Admin creates a staff account → that phone number can log in and access the dashboard.

**Dependencies:** Unit 12 (dashboard shell), Unit 9 (booking flow must exist to verify blocked slots appear unavailable).

---

## Unit 15 — Admin: Revenue Report

**Builds:**
Revenue report page at `app/(dashboard)/orders/reports/` (admin only). Summary cards: total revenue all time, revenue this month, total confirmed bookings, total food orders placed. Daily breakdown table for the current month showing count and revenue per day. All figures computed server-side from `bookings` and `orders` tables using the service role client. Staff role is blocked by middleware from accessing this route.

**What you see when done:**
Admin sees accurate revenue totals and daily breakdown. A staff-role account attempting to access `/dashboard/orders/reports` is redirected.

**Dependencies:** Unit 12 (dashboard shell), Unit 14 (role enforcement patterns must be established).

---

## Unit 16 — SEO Audit & Final Polish

**Builds:**
A pass across all public pages confirming: unique `<title>` and `<meta name="description">` on every page, single `<h1>` per page, semantic HTML throughout, `og:title` and `og:image` for social sharing, `robots.txt` and `sitemap.xml` generated. Micro-animation audit: hero fade-in, card hover lift, button press state, slot chip selection transition — all respecting `prefers-reduced-motion`. Responsive layout check at 375px (mobile) and 1280px (desktop) for all public pages.

**What you see when done:**
Every public page passes a manual SEO checklist. All animations are smooth. Site is visually correct at mobile and desktop breakpoints.

**Dependencies:** All public-facing units (1–7) must be complete.

---

## Build Order Summary

| # | Unit Name | Primary Boundary | Depends On |
|---|---|---|---|
| 1 | Project Scaffold & Design System | `styles/`, project root | — |
| 2 | Supabase Project & Database Schema | `lib/supabase/`, Supabase | 1 |
| 3 | RLS & Auth Middleware + OTP Login | `app/(auth)/`, `middleware.ts` | 2 |
| 4 | Homepage | `app/(public)/` | 1 |
| 5 | Public Rooms Page | `app/(public)/rooms/` | 2, 4 |
| 6 | Public Menu Page | `app/(public)/menu/` | 2 |
| 7 | Features Page | `app/(public)/features/` | 4 |
| 8 | Booking Slot Validation Logic + Tests | `lib/booking/` | 2 |
| 9 | Room Booking Flow + Payment + Confirmation | `app/(customer)/book/`, `app/api/bookings/`, `lib/razorpay/` | 3, 6, 8 |
| 10 | Delivery Radius Logic + Food Order Flow + Payment | `app/(customer)/order/`, `app/api/orders/`, `lib/delivery/` | 9, 6 |
| 11 | Customer Account (History) | `app/(customer)/account/` | 9, 10 |
| 12 | Staff Dashboard (Orders, Bookings, Realtime) | `app/(dashboard)/` | 3, 9, 10 |
| 13 | Admin: Menu Management | `app/(dashboard)/menu/` | 12, 6 |
| 14 | Admin: Slot Blocking & Staff Management | `app/(dashboard)/slots/`, `app/(dashboard)/staff/` | 12, 9 |
| 15 | Admin: Revenue Report | `app/(dashboard)/orders/reports/` | 12, 14 |
| 16 | SEO Audit & Final Polish | All public pages | 1–7 |
