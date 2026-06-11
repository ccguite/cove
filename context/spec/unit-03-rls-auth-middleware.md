# Spec: Unit 3 — RLS & Auth Middleware + OTP Login

## Goal

Implement Supabase Row-Level Security policies for all 10 tables, build the Phone OTP authentication flow (login page + OTP verification page) as faithful Next.js implementations of the provided HTML designs, create Next.js middleware to protect customer and dashboard routes by role, and automatically insert a `users` row with `role = 'customer'` on first successful OTP verification.

---

## Design

### Login Page — `app/(auth)/login/page.tsx`

Derived from `UI_DESIGN/login_cove_cafe_lounge/code.html`.

**Layout:**
- Full-screen cream (`var(--color-background)`) background with a subtle repeating cross/plus SVG pattern at low opacity (`rgba(74, 52, 40, 0.03)`)
- Desktop: fixed top nav bar (`hidden md:flex`) — "COVE" brand name (Playfair Display, display-xl size, espresso) + nav links (Home, Rooms, Menu) + "Book Now" button
- Centred login card: `max-width: 480px`, white background (`var(--color-surface-white)`), `border-radius: var(--radius-xl)`, ambient espresso shadow (`0 20px 40px -10px rgba(74, 52, 40, 0.08)`), padding `48px` desktop / `var(--space-12)` mobile
- Decorative top accent bar on the card: 1px full-width gradient line `from transparent → #E1C0AF → transparent` at 50% opacity
- Footer: centered, `label-sm` Inter, terms and copyright text

**Login Card Content (Phase 1 — Phone Entry):**
- Mobile-only: "COVE" Playfair Display heading above the form
- `<h1>`: "Welcome back to COVE" — Playfair Display, `headline-md` (32px/600), espresso `#321F14`
- `<p>`: "Enter your phone number to receive a secure OTP." — Inter, `body-md`, `#4F453F`
- Phone input: bottom-border-only style (no box border), country code selector (`+91` for India) with chevron icon on the left, separated by a thin vertical divider. Focus state transitions border to `#4A3428`. Placeholder: `9876543210`
- "Send OTP" button: full-width, `background: var(--color-primary)` (`#4A3428`), white text, `border-radius: var(--radius-xl)`, 16px vertical padding, Inter label-md uppercase with wide letter-spacing, 0.3s opacity transition on hover
- Divider with "or" text centred
- "Continue as Guest" secondary button: transparent background, `border: 1px solid var(--color-border-strong)`, same sizing as primary button

**Note on "Continue as Guest"**: This button is visible in the design. For v1, clicking it redirects to the homepage. It does not create an anonymous session.

**OTP Verification (Phase 2 — inline state switch):**
- After clicking "Send OTP", the phone form hides with a fade-out and the OTP input group fades in (`fadeIn` keyframe: `opacity 0 + translateY 10px → opacity 1 + translateY 0`, 0.3s ease-out)
- 6 individual single-character text inputs in a row: `width: 48px`, `height: 56px`, centred text, `border-bottom: 1px solid var(--color-border)`, no box border. Focus state transitions border to `var(--color-primary)`. Auto-advance on input, backspace goes to previous.
- "Verify" button: same styling as "Send OTP" button
- "Didn't receive code? **Resend**" — Inter label-sm, Resend is a link in primary espresso

---

### OTP Verification Page — `app/(auth)/verify/page.tsx`

Derived from `UI_DESIGN/otp_verification_cove/code.html`.

**Layout:**
- Full-screen background: cream with a subtle grid pattern (`linear-gradient` lines at `rgba(74, 52, 40, 0.05)`, 40px grid)
- Centred card: `max-width: md (448px)`, `background: var(--color-surface)` (`#F8F3EB`), `border-radius: var(--radius-xl)`, ambient shadow, `border: 1px solid var(--color-surface-highest)`, padding `var(--space-12)`

**Card Content:**
- Logo header above the card: "Seoul Serenity" (but implementation uses "COVE") in Playfair Display, headline-md, primary espresso
- `<h2>`: "Verify your number" — Playfair Display, headline-sm (24px/500), primary espresso
- `<p>`: "We've sent a 6-digit code to" + phone number shown in bold primary espresso
- 6 OTP input boxes: `width: 48px`, `height: 56px`, `background: var(--color-surface-white)`, `border: 1px solid var(--color-surface-highest)`, `border-radius: var(--radius-md)`. Focus state: `border-color: var(--color-primary)`, `ring: 1px solid var(--color-primary)`. Each input has an `aria-label` ("Digit 1" through "Digit 6")
- Spin button arrows hidden on number inputs via CSS
- "Verify & Continue" button: full-width, `background: var(--color-primary)` (`#4A3428`), white text, `border-radius: var(--radius-xl)`, with a right-arrow Material Symbol icon
- Divider line between verify button and secondary actions
- "Didn't receive the code? **Resend in 00:45**" — 45-second countdown timer, resend button disabled until timer reaches 0
- "✏ Change Number" button — icon + text, label-md, on-surface-variant colour, transitions to primary on hover
- Footer links: Privacy · Terms · Help (label-sm, Inter)

**Two-page vs single-page decision**: The design provides two separate HTML files. Implement as **two separate pages** (`/login` and `/verify`) connected by URL state (phone number passed as a query param or via Next.js router state), rather than as a single-page inline state toggle. This is cleaner architecturally and allows the OTP verification page to be bookmarkable.

---

### Dashboard Shell — `app/(dashboard)/layout.tsx`

Derived from `UI_DESIGN/staff_dashboard_orders_bookings/code.html` and `UI_DESIGN/admin_overview_cove/code.html`.

**Desktop Layout (≥ md breakpoint):**
- Fixed left sidebar: `width: 256px` (admin design) or `width: 320px` (staff design — use 256px for consistency), `height: 100vh`, `background: var(--color-surface)`, `border-right: 1px solid var(--color-border-subtle)`, flex column with `padding: var(--space-6)`
- Sidebar header: "COVE" in Playfair Display headline-sm + subtitle text "Staff Dashboard" or "Admin Panel" in Inter label-md uppercase on-surface-variant
- Sidebar nav links: each link is a flex row (`gap: var(--space-3)`), Material Symbol icon + label-md text. Active link: `background: var(--color-secondary-container)` (`#EADECD`), primary espresso text, font-weight bold. Inactive: on-surface-variant text, hover `background: var(--color-surface-high)`
- **Staff nav items**: Overview, Orders, Bookings, Room Status
- **Admin additional nav items** (only shown to admin role): Menu Management, Staff, Analytics/Reports, Settings
- Sidebar footer: logged-in user avatar (circle, espresso brown background), name, role label. Log out option.
- Top bar (admin design): `height: 64px`, white background, notification bell with error dot, user avatar + "Manager" label + chevron
- Main content area: `flex-1`, `overflow-y: auto`, background `var(--color-background)`

**Mobile Layout (< md breakpoint):**
- Mobile top nav bar: fixed, backdrop-blur, "COVE" brand + hamburger menu icon
- Bottom nav bar: fixed, `height: 64px`, cream background with backdrop blur, rounded-top corners, 4 items with icons and labels. Active item: filled espresso-brown circle chip. Items: Overview, Orders, Bookings (staff) / Overview, Rooms, Menu, Book (admin mobile)

**Role-conditional nav rendering**: The dashboard layout receives the user's role from the session. Admin-only nav items are rendered only when `role === 'admin'`. This is done server-side in the layout component — no client-side show/hide.

---

### Customer Account Page — `app/(customer)/account/page.tsx`

Derived from `UI_DESIGN/my_dashboard_cove/code.html`.

**Layout:**
- Standard public site nav at top (shared `<Header>` component, built in Unit 4 — for now use a minimal nav)
- `max-width: var(--container-max)`, `padding: var(--space-16) var(--space-5)` (desktop/mobile)
- `<h1>`: "My Account" — Playfair Display, headline-lg (desktop) / headline-lg-mobile (mobile)
- Welcome message: "Welcome back, [name]." — Inter body-md, on-surface-variant
- 12-column grid: **Left sidebar** (4 cols) + **Main content** (8 cols)

**Left Sidebar:**
- Profile card: circular avatar (placeholder icon), name in headline-sm Playfair, phone number in body-md with a verified checkmark icon, stats grid (Bookings count | Points — Points shows `0` since loyalty is out of scope, or hide Points column)
- Settings nav: Profile (active), Log Out (styled in error red)

**Main Content:**
- "Upcoming Visits" section with booking cards (confirmed badge, room name, date calendar widget, time, guests, Details button)
- "Recent Orders" section as a table: Date, Items, Total, Status
- "Personal Details" form: Name field (editable), Email field (editable), Phone field (disabled, "Verified via OTP" hint)
- Empty states for when no bookings or orders exist yet

**In scope for Unit 3**: Only the page shell, profile card, and logout functionality. The booking and order history sections will show empty states until Units 9 and 10 create real data. The personal details form save action is wired up (updates the `users` table).

---

## Implementation

### 4.1 RLS Policies

Run the following SQL in the Supabase SQL editor. Enable RLS on each table first, then define policies.

```sql
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

-- Insert is handled by the trigger (see section 4.2) using service role
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
-- Staff and admin can read slot locks (for dashboard availability view)
create policy "slot_locks: staff read"
  on public.slot_locks for select
  using (public.get_user_role() in ('staff', 'admin'));

-- All authenticated users can read slot locks (needed for availability checks)
create policy "slot_locks: authenticated read"
  on public.slot_locks for select
  using (auth.uid() is not null);

-- =====================
-- blocked_slots policies
-- =====================
-- All authenticated users can read blocked slots (for availability display)
create policy "blocked_slots: authenticated read"
  on public.blocked_slots for select
  using (auth.uid() is not null);

-- Only admin can insert/update/delete blocked slots
create policy "blocked_slots: admin write"
  on public.blocked_slots for all
  using (public.get_user_role() = 'admin');
```

---

### 4.2 Auto-Create User Row on First OTP Verification

Create a Postgres function + trigger that automatically inserts a row into `public.users` whenever a new row is inserted into `auth.users` (i.e., on first OTP verification):

```sql
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();
```

This trigger fires server-side in Supabase whenever `auth.users` gets a new row. It creates the corresponding `public.users` row with `role = 'customer'`. No application code needs to manually insert the user row.

---

### 4.3 Install Dependencies

```bash
npm install zod
```

`zod` is installed in this unit for validating the phone number and OTP inputs in API routes.

---

### 4.4 Next.js Middleware — `middleware.ts`

Create `middleware.ts` at the project root (same level as `app/`):

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  // Routes that require any authenticated session
  const customerRoutes = ['/book', '/order', '/account'];
  // Routes that require staff or admin role
  const dashboardRoutes = ['/dashboard'];

  const isCustomerRoute = customerRoutes.some(r => pathname.startsWith(r));
  const isDashboardRoute = dashboardRoutes.some(r => pathname.startsWith(r));

  if (isCustomerRoute || isDashboardRoute) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isDashboardRoute && session) {
    // Fetch user role from public.users
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const role = user?.role;

    if (!role || role === 'customer') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/book/:path*',
    '/order/:path*',
    '/account/:path*',
    '/dashboard/:path*',
  ],
};
```

---

### 4.5 Login Page — `app/(auth)/login/page.tsx`

**File structure:**
```
app/
└── (auth)/
    ├── layout.tsx        # Minimal layout: full-height, no padding, no nav
    ├── login/
    │   ├── page.tsx      # Login page component
    │   └── login.css     # Page-specific styles
    └── verify/
        ├── page.tsx      # OTP verification page
        └── verify.css    # Page-specific styles
```

**`app/(auth)/layout.tsx`:**
- Minimal layout — renders `{children}` with no nav or footer
- Sets `min-height: 100vh` on a wrapper div
- No authentication check — auth pages must be accessible without a session

**`app/(auth)/login/page.tsx`:**
- Export `metadata` with `title: "Login — COVE"` and `description`
- The page is a Client Component (`'use client'`) because it manages form state
- State: `phase: 'phone' | 'otp'`, `phone: string`, `loading: boolean`, `error: string | null`
- On "Send OTP" submit:
  - Validate phone with `zod`: must be a 10-digit Indian mobile number (starts with 6–9, exactly 10 digits)
  - Call `supabase.auth.signInWithOtp({ phone: '+91' + phone })`
  - On success: set `phase = 'otp'` to show OTP inputs
  - On error: display error message below the form
- On "Verify" submit:
  - Concatenate the 6 OTP input values into a single string
  - Call `supabase.auth.verifyOtp({ phone: '+91' + phone, token: otp, type: 'sms' })`
  - On success: read `next` query param from URL, redirect to `next ?? '/'`
  - On error: display "Invalid or expired OTP" error below the inputs
- Country code is hardcoded to `+91` (India) — not a dropdown for v1
- "Continue as Guest" redirects to `/`
- The `fadeIn` CSS animation transitions between phone and OTP phases

**OTP input behaviour (JavaScript):**
- Auto-advance focus to next input when a digit is entered
- On backspace when input is empty, focus moves to previous input
- On paste: distribute pasted digits across inputs (handle 6-digit SMS OTP paste)
- All 6 individual inputs are referenced via `useRef` array

---

### 4.6 OTP Verification Page — `app/(auth)/verify/page.tsx`

This page is used as an **alternative standalone entry point** (e.g. deep-linked from SMS, or if the user navigates away and comes back). It receives the phone number as a `?phone=` query param.

- Reads phone from `searchParams.phone`
- If no phone param present, redirects to `/login`
- Same 6-input OTP UI as the login page's OTP phase
- 45-second resend countdown timer using `setInterval` in a `useEffect`
- "Resend" button disabled until timer reaches 0; on click, calls `supabase.auth.signInWithOtp` again and resets the timer
- "Change Number" button redirects back to `/login`
- On successful verify: redirect to `searchParams.next ?? '/'`

---

### 4.7 Dashboard Shell — `app/(dashboard)/layout.tsx`

This layout is a Server Component that:
1. Reads the session using `createSupabaseServerClient()`
2. Fetches the user's role from `public.users`
3. Renders the sidebar with role-conditional nav items
4. Passes the `role` down to child pages via a React Context (`DashboardContext`) so child pages can conditionally show/hide admin-only UI without a separate Supabase fetch

**Sidebar nav items rendered for each role:**

| Nav Item | Icon | Staff | Admin |
|---|---|---|---|
| Overview | `dashboard` | ✅ | ✅ |
| Orders | `receipt_long` | ✅ | ✅ |
| Bookings | `book_online` | ✅ | ✅ |
| Room Status | `meeting_room` | ✅ | ✅ |
| Menu Management | `restaurant_menu` | ❌ | ✅ |
| Staff | `badge` | ❌ | ✅ |
| Reports | `bar_chart` | ❌ | ✅ |
| Settings | `settings` | ❌ | ✅ |

**`app/(dashboard)/page.tsx`** — Dashboard overview page (stub for this unit):
- Renders a minimal "Dashboard" heading and the current user's name and role
- No KPI cards yet (those come in Unit 12)
- Confirms the layout renders and role-gating works

**`app/(dashboard)/context.tsx`** — Client component context:
```ts
'use client';
import { createContext, useContext } from 'react';
import type { UserRole } from '@/lib/supabase/types';

type DashboardContextValue = { role: UserRole };
export const DashboardContext = createContext<DashboardContextValue>({ role: 'staff' });
export const useDashboard = () => useContext(DashboardContext);
```

---

### 4.8 Customer Account Page — `app/(customer)/account/page.tsx`

- Server Component — reads session and fetches the user's profile from `public.users`
- Renders the profile card with real `name` and `phone` from the database
- Booking history and order history sections render **empty states** (no data yet): "No upcoming visits" / "No recent orders" with a subtle icon and a CTA to book or order
- Personal details form is a Client Component (`PersonalDetailsForm`) that accepts the current `name` and `email` as props
  - On save: calls `PATCH /api/account/profile` which updates `name` and `email` in `public.users` for the authenticated user
  - Phone field is always disabled — it is the auth identity and cannot be changed
- Log out button: calls `supabase.auth.signOut()` then redirects to `/`

**`app/api/account/profile/route.ts`** — Profile update API:
```ts
// PATCH /api/account/profile
// Body: { name: string, email: string }
// Auth: session required
// Returns: { data: { name, email } } or { error }
```

---

### 4.9 Auth Callback Route — `app/auth/callback/route.ts`

Supabase requires a callback route to handle the OAuth/OTP token exchange flow. Create:

```ts
// app/auth/callback/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
```

---

### 4.10 CSS for Auth Pages

**`app/(auth)/login/login.css`** — Styles specific to the login page:

```css
.login-page {
  background-color: var(--color-background);
  background-image: url("data:image/svg+xml,..."); /* cross pattern from HTML */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-card {
  background-color: var(--color-surface-white);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px -10px rgba(74, 52, 40, 0.08);
  width: 100%;
  max-width: 480px;
  padding: var(--space-12);
  position: relative;
  overflow: hidden;
}

@media (min-width: 768px) {
  .login-card {
    padding: 56px;
  }
}

.login-card-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    #E1C0AF,
    transparent
  );
  opacity: 0.5;
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
  transition: border-color 0.3s;
}

.phone-input-wrapper:focus-within {
  border-bottom-color: var(--color-primary);
}

.country-code {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  padding-right: var(--space-2);
  border-right: 1px solid var(--color-border);
  margin-right: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--text-size-body-lg);
  white-space: nowrap;
}

.phone-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: var(--text-size-body-lg);
  color: var(--color-text-primary);
}

.phone-input::placeholder {
  color: var(--color-border-strong);
}

.otp-inputs {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
}

.otp-input {
  width: 48px;
  height: 56px;
  text-align: center;
  font-family: var(--font-display);
  font-size: var(--text-size-headline-sm);
  font-weight: 500;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  outline: none;
  transition: border-color 0.2s;
}

.otp-input:focus {
  border-bottom-color: var(--color-primary);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.btn-primary {
  width: 100%;
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  letter-spacing: var(--text-ls-label-md);
  text-transform: uppercase;
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-xl);
  border: none;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-primary:hover { opacity: 0.9; }
.btn-primary:active { transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  width: 100%;
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-strong);
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 600;
  letter-spacing: var(--text-ls-label-md);
  text-transform: uppercase;
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: var(--color-surface-low);
}
```

---

## Dependencies

```bash
npm install zod
```

| Package | Role |
|---|---|
| `zod` | Phone number and OTP input validation in API routes and client-side forms |

No other new packages needed. Supabase packages are already installed from Unit 2.

---

## Verification Checklist

Complete every item before marking Unit 3 done and starting Unit 4.

### RLS Policies
- [ ] Run `select tablename, rowsecurity from pg_tables where schemaname = 'public';` in the Supabase SQL editor and confirm `rowsecurity = true` for all 10 tables
- [ ] The `get_user_role()` helper function exists (check **Database → Functions**)
- [ ] The `on_auth_user_created` trigger exists (check **Database → Triggers**)
- [ ] Test customer isolation: log in as customer A, verify that `select * from bookings` via the anon client returns only customer A's rows (none if customer A has no bookings)
- [ ] Test public read: confirm `select * from menu_items` returns all rows without authentication

### Authentication Flow
- [ ] Visiting `localhost:3000/login` renders the login card with the correct design (cream background, cross pattern, espresso card shadow, "COVE" brand, phone input with +91 prefix)
- [ ] Entering a 10-digit phone number and submitting transitions to the OTP input group with the `fadeIn` animation
- [ ] Entering less than 10 digits or an invalid format shows a validation error without calling Supabase
- [ ] In Supabase test mode, entering `123456` as the OTP verifies successfully
- [ ] After successful OTP verification, a new row appears in the `public.users` table with `role = 'customer'` and the correct phone number
- [ ] After successful OTP verification, the user is redirected to the `next` query param URL, or `/` if no `next` was set
- [ ] The "Continue as Guest" button redirects to `/` without creating a session
- [ ] The standalone `/verify?phone=9876543210` page renders correctly with the phone number displayed
- [ ] The 45-second resend countdown counts down and enables the "Resend" button when it reaches 0
- [ ] "Change Number" from the verify page redirects back to `/login`

### Middleware
- [ ] Visiting `localhost:3000/account` without a session redirects to `/login?next=/account`
- [ ] After logging in from that redirect, the user is sent to `/account` (not `/`)
- [ ] Visiting `localhost:3000/dashboard` without a session redirects to `/login?next=/dashboard`
- [ ] Logging in as a `customer`-role user and visiting `/dashboard` redirects to `/`
- [ ] Logging in as a `staff`-role user (manually set in Supabase table editor) and visiting `/dashboard` renders the dashboard

### Dashboard Shell
- [ ] The dashboard shell renders with the correct sidebar design: "COVE" brand, nav links with icons, user footer
- [ ] Staff role sees: Overview, Orders, Bookings, Room Status (4 items)
- [ ] Admin role sees all 8 nav items including Menu Management, Staff, Reports, Settings
- [ ] The dashboard overview page renders "Dashboard" heading and the logged-in user's name
- [ ] Mobile: bottom nav bar renders at `< md` breakpoint; sidebar is hidden
- [ ] Desktop: left sidebar renders at `≥ md` breakpoint; bottom nav is hidden

### Customer Account Page
- [ ] `/account` renders the profile card with the real user's name and phone number from Supabase
- [ ] The bookings section shows an empty state with a "Book a Room" CTA
- [ ] The orders section shows an empty state with an "Order Food" CTA
- [ ] The Personal Details form displays the current name and email (email may be blank)
- [ ] Editing the name and clicking "Save Changes" updates the `users` table and shows a success message
- [ ] The phone field is read-only and shows "Verified via OTP" hint
- [ ] Clicking "Log Out" signs out the session and redirects to `/`

### Architecture Compliance
- [ ] No Supabase service role key is used in any client component or page component
- [ ] The middleware only uses the anon key client — never the service role client
- [ ] `zod` validation runs before any Supabase call in both the login and verify flows
- [ ] The `on_auth_user_created` trigger (not application code) is responsible for creating the `public.users` row
- [ ] `npx tsc --noEmit` passes with no errors

### Next Step
- [ ] State the first task of Unit 4: build the public homepage with all sections using design tokens and existing components
