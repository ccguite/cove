# COVE — Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

Implementation

## Current Goal

Project Complete — All units verified and optimized

## Completed

- `project-overview.md` — product definition, goals, user flows, features, scope, success criteria
- `architecture.md` — stack, system boundaries, storage model, auth/access model, invariants
- `code-standards.md` — TypeScript rules, naming conventions, component patterns, API conventions, banned patterns
- `ai-workflow-rules.md` — agent behaviour rules, scoping rules, verification checklist
- `ui-context.md` — full colour token system, typography scale, border radius scale, spacing scale, component colour map
- `build-order.md` — 16 units in dependency order, each with a visible result and system boundary
- Unit 1: Project Scaffold & Design System — Next.js project scaffolded, design token custom properties, base styles, and proof-of-life page verified.
- Unit 2: Supabase Project & Database Schema — Created SQL migration and seed files for all 10 tables, generated indexes, initialised standard/service-role Supabase clients, defined database types, and added test query support on homepage.
- Unit 3: RLS & Auth Middleware + OTP Login — Created SQL migration for database roles and triggers, built authentication middleware and callback endpoint, implemented phone OTP login/verify screens with countdown timers/focus management, added customer space shell with personal details API, and configured the staff dashboard layout.
- Unit 4: Homepage — Created public page and shared navigation shell layout (sticky desktop top-nav, mobile top header/bottom-nav, footer), styled with vanilla CSS custom properties using SEO best practices, and integrated dynamic rooms querying with server-side fallbacks.
- Unit 5: Public Rooms Page — Created public rooms catalog (`/rooms`) and dynamic details page (`/rooms/[slug]`), fetching records server-side from Supabase with local fallback structures, and generating static paths (SSG) for high-performance edge rendering.
- Unit 6: Public Menu Page — Created menu browser page (`/menu`) displaying categorized food and drinks from Supabase, integrated dynamic category query filters, customized sold-out states and seasonal item badge overlays, and added mock cart summaries.
- Unit 7: Features Page — Created static features showcase page (`/features`) representing walk-in services (Cat Café, Billiards Lounge, and Studio Booth) with their pricing and hours, styled in an alternating editorial layout.
- Unit 8: Booking Slot Validation Logic + Tests — Built core room booking validation functions inside `lib/booking/slotValidator.ts` and verified with a comprehensive unit test suite in `lib/booking/slotValidator.test.ts running on Vitest.
- Unit 9: Room Booking Flow (Customer UI + API + Payment) — Built stepper-based room booking wizard under `/book` with Suspense static optimization, server-side available-slots, slot-locking (10-minute TTL), and payment order creation endpoints, server-only signature-verified Razorpay webhook endpoint, and booking confirmation page.
- Unit 10: Delivery Radius Logic + Food Order Flow (UI + API + Payment) — Built Haversine-based delivery radius validation library, standalone stepper wizard for takeaways and deliveries, API routes for address validation and order creation, and updated Razorpay webhook handler to process standalone orders.
- Unit 11: Customer Account (Booking & Order History) — Implemented responsive account details page with interactive tabbed views for space bookings (with calendar tiles and pre-ordered items) and standalone food orders (with type icons and menus), alongside editable personal details form.
- Unit 12: Staff Dashboard (Orders, Bookings & Real-time Notifications) — Built operations dashboard with real-time orders queue, chronological arrivals check-ins, room occupancy status board, status transition endpoints, and audio-visual notifications wrapper.
- Unit 13: Admin Menu Management (CRUD + Availability) — Implemented menu management operations board, horizontal category scrollbar tabs, text-based search filtering, availability state selection, dynamic toggle checkboxes, custom edit modal pre-fills, drag-and-drop image uploads to bucket, revalidatePath cache invalidation, and custom deletion confirmation modal.
- Unit 14: Admin Operations & Slot Blocking (Manual Blocks) — Updated auth middleware to restrict `/dashboard/menu/*`, `/dashboard/slots/*`, and `/dashboard/staff/*` to admin accounts. Built manual slot blocking page with occupancy status card checks and active blocks list. Created staff management panel with credentials creation (utilizing service role auth client) and operational role assignment editing.
- Unit 15: Admin Revenue & Reservation Reports (PDF + Charts) — Implemented server-side reporting service to query and compile key performance metrics (all-time revenue, Month-to-Date revenue, booking counts, and standalone order counts). Built a dynamic administrative analytics page showing KPI summary cards with hover transitions and a detailed monthly operations daily ledger table.
- Unit 16: SEO Audit & Production Polish — Performed comprehensive SEO audit and final visual polish across all public-facing routes. Verified sitemaps, robots.txt crawl rules, heading structures, card hover animations, focus rings, accessibility prefers-reduced-motion styles, and added aria-labels.
- Strict Auth & Role Separation — Implemented strict separate portals for Super Admin (`/admin`), Reception (`/reception`), and Kitchen (`/kitchen`) under dedicated Next.js route groups, completely separating their access tables and dashboards from customer routes. Included a custom staff login page (`/staff/login`), redirected all legacy `/dashboard/*` endpoints, updated middleware route tables, adjusted administrative APIs, and verified zero compilation errors.
- UI Visual Upgrade & Homepage Reordering — Reordered homepage sections to place walk-in experiences last, adjusted backgrounds to alternate, aligned rooms catalog classes with page.css styles, updated fallbacks to Movietopia (slug `movietopia`), added COMING SOON overlays on desaturated experiences cards, and updated menu hero and delivery footer layout styles.
- Unit 17 (Addendum): Booking Steps Reduction & Checkout Lock Conflict Resolution — Resolved checkout slot conflict errors by associating locks with the user ID (`locked_by` column) and bypassing conflict verification for the current user during payment initialization. Consolidated the date/time picker with the guest capacity counter onto a single unified "Reservation Details" step, reducing the room booking wizard from 5 steps to 4.
- Unit 18 (Addendum): Customer Account Profile Card Removal & Left Sidebar Form Relocation — Resolved typography overlap bugs by setting explicit heading line-heights globally and locally. Removed the unrequired avatar/points card and logout button, relocated the modernized, vertically stacked 'My Details' form to the left sidebar, and expanded the bookings/orders history tables on the right.
- Unit 19 (Addendum): Café Menu Card Details, Category Grid Split, Experience Pictures Overlay Removal, Privacy Policy Footer Alignment, Header Booking Icon, Dropdown Options Consolidation, and Settings Change Password Tab — Removed description paragraphs from public menu cards, converted the horizontal category selector to a responsive grid (2 columns mobile, 3 columns tablet, 6 columns desktop), stripped the desaturated filter and "Coming Soon" overlay from walk-in experience images, created a dedicated privacy policy stylesheet to move the updated text to the bottom right, added a calendar-based booking icon next to the cart icon in the header navigation, consolidated separate header dropdown links into a unified "My Account" link, and built a dedicated "Settings" tab for password updates.
- Session Isolation (Addendum) — Isolated admin/staff login sessions from customer sessions using separate cookie names (`sb-staff-auth-token` and `sb-customer-auth-token`). Updated middleware, browser client singletons, server client initializers, API routes, layout pages, and logout handlers to dynamically resolve and process role-specific authentication contexts, fully allowing independent logins and customer browsing on the same browser.
- Homepage Café Menu UI Upgrade (Addendum) — Upgraded the homepage café menu section from plain text to a modern visual showcase. Generated high-quality coffee assets for "Specialty Einspänner" and "Mizo Specialty Latte", staged and mapped all featured croffle and coffee images, and designed card zoom transitions and flex layout grids in the homepage style guides.
- Policies & Rules Page (Addendum) — Created a dedicated Booking & Refund Policies page (`/policies`) along with a responsive stylesheet to outline room capacities, cancellation/refund guidelines, café pre-orders, and house rules. Updated public footer layouts and auth logins footer links to reference the policies page.
- Offline Bookings & Room Food Combos (Addendum) — Added a column `only_for_rooms` on `menu_items` and created a new SQL migration. Integrated combo package filtering on the public menu page and blocked standalone food orders containing combos in API checkouts. Created an offline bookings API route and built a "New Offline Booking" form modal inside `BookingsArrivalsClient` for Reception/Admin staff to easily reserve slots for walk-in guests with dynamic capacity checks and pre-ordered food items.
- Fix for Authentication Email Code Delivery Issues (Addendum) — Created database trigger `trg_auto_confirm_new_users` running `BEFORE INSERT` on `auth.users` to automatically set `email_confirmed_at = now()`, marking all registrations as pre-confirmed. Updated all existing unconfirmed user records to be confirmed, and refactored the frontend signup handler in `app/(auth)/login/page.tsx` to immediately redirect users on successful signup when a session is created.

## In Progress

- None

## Next Up

- None

## Open Questions

- None. All planning questions resolved.

## Architecture Decisions

- Next.js 14 (App Router) + Supabase + Razorpay + Vercel
- Email-Password authentication (Supabase auth)
- Razorpay in test/mock mode during build (live payments deferred pending merchant account)
- Delivery radius hardcoded to 5km (Google Maps API deferred)
- Single dashboard with role-based access (Admin + Staff) — not two separate dashboards
- Price snapshotted at checkout time on `order_items` and `booking_food_items` rows
- Slot-locking via `slot_locks` table with 10-minute TTL, cleaned by `pg_cron`

## Session Notes

- Completed Unit 3 including SQL migrations, middleware, OTP login/verify screens, customer account dashboard, and administrative layout shell.
- Linked remote Supabase project (`bdjitfwxtylhkqrqevyh`), configured `.env.local`, pushed all schema migrations, enabled the `pg_cron` extension, and seeded the remote database with initial rooms and menu categories.
- Resolved route group conflict between `/(dashboard)` and `/(public)` by moving the dashboard overview page to a nested `dashboard/` subdirectory (resolving to `/dashboard`), avoiding collision at `/`.
- Updated `context/architecture.md` to reflect the nested dashboard structure.
- Migrated primary login from Phone OTP to Email-Password. Deleted the verification endpoint (`app/(auth)/verify/`) and updated the account profile page to make Email the read-only login identifier and Phone Number an editable detail.
- Verified that the homepage renders successfully on port 3000 and `/dashboard` redirects to `/login?next=%2Fdashboard` as expected.
- Completed the Frontend UX & Header Account Refinement:
  - Implemented dynamic path matching active underline indicators on top header links (`Home`, `Rooms`, `Cafe`, `Experience`, `Location`).
  - Added guest vs authenticated session state in the header using browser Supabase clients.
  - Implemented the Account dropdown panel containing quick links to bookings, orders history, and logout.
  - Integrated click-outside detection to automatically collapse the dropdown.
  - Built a centralized client-side `<ScrollToTop />` component to reset viewport scroll positions on route changes.
  - Created a dedicated Location page under `/location` showing address, contacts, operating hours, and a themed map.
  - Built the standalone `/cart` page with takeaway/delivery toggles, ₹299 minimum delivery subtotal, and 5km radius checking.
  - Integrated Razorpay payment simulation on `/cart` checkout.
  - Created the success confirmation page at `/cart/confirmation` wrapped in a `<Suspense>` boundary.
  - Updated the customer account page to handle `tab` parameters dynamically.
- Fixed Checkout and Booking Internal Server Error:
  - Configured RLS write bypass in API routes `/api/bookings/lock`, `/api/bookings/create`, and `/api/orders/create` using the service role client (`createSupabaseServiceClient`).
  - Added client-side mock-payment bypass in `/book` and `/cart` checkout flows to handle empty/unconfigured Razorpay environment variables seamlessly in local development mode.
- Fixed Database Write Permissions & Checkout Failures (Final Fix):
  - Created migration `20240009_customer_write_policies.sql` to add customer RLS INSERT/UPDATE/DELETE policies for `bookings`, `booking_food_items`, `orders`, `order_items`, and `slot_locks`.
  - Created migration `20240010_fix_order_status_constraint.sql` to add `'pending_payment'` to the `orders.status` check constraint.
  - Added a `security definer` database RPC function `confirm_payment_via_webhook(p_razorpay_order_id, p_secret)` to authorize payment capture updates without requiring `SUPABASE_SERVICE_ROLE_KEY`.
  - Refactored API routes `/api/bookings/lock`, `/api/bookings/create`, `/api/orders/create`, and `/api/razorpay/webhook` to utilize standard clients and the RPC webhook helper, completely resolving the 500 server error checkout issues.
- Fixed Client Logout Persistence:
  - Created server-side route handler `/api/auth/logout/route.ts` to execute `supabase.auth.signOut()` on the server context, enabling cookie removal.
  - Refactored `LogoutButton.tsx`, `SidebarLogout.tsx`, and `HeaderNav.tsx` client components to POST to `/api/auth/logout` prior to client-side signOut, completely preventing session persistence on refresh.
- Fixed Tab Navigation and Header Dropdown Actions:
  - Awaited the asynchronous `searchParams` Promise in `app/(customer)/account/page.tsx` before extracting the `tab` query parameters. This resolves client-side navigation bugs where clicking "My Bookings" or "My Orders" in the header dropdown would change the URL but fail to switch tabs.
- Hardened Cookie Removal on Logout:
  - Refactored `/api/auth/logout/route.ts` to explicitly clear all Supabase authentication cookies (`sb-*` and `*auth-token*`) by setting their values to empty string and past expiry times, ensuring complete session termination.
- Seeded Admin & Staff Dashboard Credentials:
  - Created migrations `20240011_seed_dashboards.sql` and `20240012_seed_dashboards_fix.sql` to register an Admin account and a Staff account with secure passwords and GoTrue-compliant default values to prevent database auth service scan errors.
  - Credentials seeded:
    - **Admin**: `admin@cove.com` / `CoveAdmin2026!#` (role: `admin`)
    - **Staff**: `staff@cove.com` / `CoveStaff2026!#` (role: `staff`)
- Fixed Logout Failure & Client Redirect:
  - Modified `/api/auth/logout/route.ts` to catch any error during `supabase.auth.signOut()` on the server and always proceed to clear cookies and return success, preventing stuck sessions when tokens are invalid.
  - Refactored `LogoutButton.tsx`, `SidebarLogout.tsx`, and `HeaderNav.tsx` client components to wrap network requests and client signOut in separate try/catch blocks, and explicitly delete all client-side state (including all local/session storage keys starting with `sb-`, `auth-token`, `cove-user`, and non-HTTP-only cookies via `document.cookie`).
  - Forced a reload with `window.location.href = '/'` instead of Next.js soft transitions, resolving the logout stuck state.
  - Fixed duplicate ref bug in `components/HeaderNav.tsx` where both desktop and mobile dropdown wrappers shared `ref={dropdownRef}`, causing the click outside listener to misidentify clicks inside the desktop wrapper as outside the mobile wrapper, instantly closing the dropdown before a link (Logout, Bookings, Orders) could fire its click handler. Split into `desktopDropdownRef` and `mobileDropdownRef`.
  - Fixed implicit any type parameter errors in `components/HeaderNav.tsx` to restore full compiler compatibility.
- Implemented Core Performance Optimizations:
  - Created a client-side singleton cache in `lib/supabase/browserClient.ts` to prevent duplicate Supabase class instantiation and network socket exhaustion.
  - Added responsive `sizes` values to all next/image tags utilizing `fill` layout layout bounds, resolving massive default bandwidth load metrics.
  - Split client-side fetching waterfalls in `book/page.tsx` by querying space definitions server-side.
  - Utilized dynamic imports on heavy dashboard modals to optimize route bundle chunks.
  - Converted the dashboard layout component to a Server Component to improve navigation state rendering.
  - Capped filter/search iterations using React `useMemo` hooks.
- Fixed Cart Page Styling Bug:
  - Imported `./page.css` in `app/(public)/cart/page.tsx` which was missing, successfully applying the warm cream/brown theme and proper layout grids for both empty and active cart states.
- Enhanced Header Alignment, Layout Consistency, and Contact Details:
  - Created `app/(customer)/layout.tsx` to wrap customer account and booking pages in the same site shell, loading consistent `HeaderNav`, `MobileBottomNav`, and `footer` components.
  - Removed duplicate header, footer, and mobile nav implementations from `app/(customer)/account/page.tsx`, and changed its container to a semantic `div` (removing invalid nested `<main>` tags).
  - Swapped positions of the Cart icon and Account dropdown/Login button in both desktop and mobile header views inside `components/HeaderNav.tsx` (placing Cart first, then Account to the right).
  - Updated the contact email of cove to `contactcoveteam@gmail.com` in `app/(public)/location/page.tsx`.
  - Fixed broken footer link (`/contact` -> `/location`) and homepage "Order Food" link (`/order` -> `/menu`) to prevent 404 errors.
- Fixed Next.js Hydration Mismatch in Date Formatting:
  - Standardized date formatting locale by changing `'default'` to `'en-US'` in `OrdersTab.tsx`, `BookingsTab.tsx`, `BookingsArrivalsClient.tsx`, `reports/page.tsx`, `SlotsClient.tsx`, and `StaffClient.tsx`. This ensures date strings match exactly between SSR and client hydration regardless of the user's browser locale.
- Implemented Admin & Staff Dashboard Redirect on Login:
  - Modified `app/(auth)/login/page.tsx` to retrieve the user object on successful authentication, query the `users` profile table, and redirect accounts with `'admin'` or `'staff'` roles to `/dashboard` by default (instead of the public homepage `/`).
- Conditionally Render Cart Icon Based on Authentication State:
  - Modified `components/HeaderNav.tsx` to wrap the desktop and mobile instances of `HeaderCartIcon` in a conditional check on the `user` session state, ensuring the cart icon is hidden from the homepage and other pages before a user logs in.
- Enhanced Dashboard Forms, Select Input Styling, and Scrollbars:
  - Added comprehensive form styles (`.form-field`, `.form-label`, `.form-input`, `select.form-input`, `textarea.form-input`) to `app/(dashboard)/dashboard.css` to fix unstyled form fields in the admin/staff panel overlays.
  - Added styling for `.empty-state-btn` in `dashboard.css` to ensure all modal action buttons and layout CTAs render properly.
  - Hidden category tab bar horizontal scrollbars on Webkit browsers by adding `.mobile-category-bar::-webkit-scrollbar { display: none; }` and resolved page-level horizontal scrolling/stretching with layout overflow fixes.
- Fixed Sidebar Logout, Added Mobile Logout, Compacted Menu Cards, and Fixed Delivery Action Buttons:
  - Added `overflow-y: auto` and compact padding/margins to `.dashboard-sidebar` to ensure the footer and logout button are fully visible on shorter laptop viewports.
  - Rendered `<SidebarLogout />` on the mobile dashboard top bar in `app/(dashboard)/layout.tsx` to enable logout on mobile devices.
  - Refactored `MenuItemCard.tsx` (reducing image height to `120px`, title font size, description text clamp to 2 lines, and vertical margins) and introduced a 4-5 column responsive grid `.menu-items-grid` inside `dashboard.css` to render menu cards compactly.
  - Created Tailwind-compatible button utility classes (`bg-primary`, `bg-secondary`, `bg-success`, `text-on-primary`, `font-label-sm`, `text-label-sm`) in `dashboard.css` to correctly color and display delivery order status buttons.
- Fixed Admin Dashboard Navigation link to Space Blocking:
  - Swapped the incorrect Settings link (`/dashboard/settings`) in `app/(dashboard)/layout.tsx` to point to `/dashboard/slots` (labeled 'Slot Blocking' with a 'block' icon) to grant admins immediate access to the manual slot blocking and room occupancy dashboard.
- Removed Redundant Room Status Overview from Slots Page:
  - Modified `app/(dashboard)/dashboard/slots/SlotsClient.tsx` to completely remove the redundant Room Status Overview cards row, as room statuses are already managed on the dedicated Room Status page (`/dashboard/status`).
  - Cleaned up all associated unused state variables (`cleaningRoomIds`, `currentTime`), Hooks, and helpers (`toggleCleaning`, `checkOccupancy`).
  - Removed inline `style={{ appearance: 'auto' }}` tags from select inputs inside the manual block creation form.
- Relocated Sidebar Logout and Styled Ordered Lists:
  - Moved the `<SidebarLogout />` button to the top `.sidebar-header` in `app/(dashboard)/layout.tsx` (placing it next to the brand name).
  - Deleted the `.sidebar-footer` containing user avatar and details from the desktop sidebar to resolve vertical cluttering.
  - Appended list styles for `.preorder-items-list` and `.preorder-item` to `dashboard.css` to remove duplicate bullet point rendering on dashboard views.
- Cleaned Dashboard Layout Styles:
  - Removed all inline styles from `app/(dashboard)/layout.tsx`'s sidebar header and mobile top bar.
  - Defined clean CSS classes `.sidebar-header`, `.mobile-top-bar-right`, and `.mobile-user-role-badge` in `app/(dashboard)/dashboard.css` to manage layout and design tokens, in compliance with standard CSS conventions.
- Implemented Strict 3-Role RBAC (Admin, Reception, Kitchen):
  - Created and applied migration `20240013_roles_and_movietopia.sql` which:
    - Deletes old `staff` user credential and replaces with `StaffReception` (reception@cove.com / CoveReception2026!#) and `StaffKitchen` (kitchen@cove.com / CoveKitchen2026!#).
    - Updates the `users.role` constraint to `('customer', 'reception', 'kitchen', 'admin')`.
    - Renames room `Haven` → `Movietopia` with updated slug.
    - Adds `status` column to `rooms` table with 6-state constraint.
    - Updates all RLS policies to scope by the new 3 staff roles.
  - Updated `middleware.ts` to enforce RBAC: kitchen role is redirected from Bookings/Room Status to Orders; reception and kitchen are blocked from admin-only routes (menu, slots, staff, reports).
  - Updated `app/(dashboard)/layout.tsx` to render role-scoped nav items: Kitchen sees Overview+Orders only; Reception sees Overview+Orders+Bookings+Room Status; Admin sees all 8 items. Sidebar subtitle shows human-readable role label.
  - Updated `app/(dashboard)/dashboard/page.tsx` overview to render role-specific stat cards: Kitchen sees Active Orders only; Reception and Admin see Orders + Bookings + Rooms.
  - Updated `app/(dashboard)/dashboard/orders/page.tsx` and `OrdersQueueClient.tsx`: Kitchen/Admin get order status-update action buttons; Reception sees read-only "View Only" badge.
  - Updated `app/(auth)/login/page.tsx` to redirect all three staff roles (admin, reception, kitchen) to `/dashboard` on successful login.
- Unified Visual Spacing and Layout Uniformity:
  - Reverted Café Menu header banner to a clean, text-only structure to match the Rooms and Walk-in Experiences headers.
  - Standardized all top-of-page container margins and paddings using the same responsive grid layout.
  - Successfully verified TypeScript types, Vitest unit tests, and production compilation builds.
- Checkout Conflict Resolution and Stepper Step Reduction:
  - Addressed checkout double-booking validation error by introducing an `excludeUserId?: string` bypass to the slot conflict library and populating the `locked_by` column on active checkout holds.
  - Reduced the customer booking stepper flow from 5 steps to 4 steps by combining the Date/Time picker and the Guest Capacity counter into a unified "Reservation Details" step.
  - Added capacity boundary auto-initialization when switching space selections.
  - Appended Vitest unit tests to cover user hold exclusions and successfully passed type and build checks.
- Customer Account UI Modernization & Spacing Overlap Fix:
  - Fixed the overlapping text bug between `.account-title` and `.account-subtitle` by defining default heading line-heights globally in `global.css` and locally in `account.css`.
  - Removed the avatar stats card and relocated the `PersonalDetailsForm` component to the left-side sidebar column (`account-sidebar`).
  - Restructured form fields vertically and styled form inputs and CTA save actions for a modern minimalist appearance.
  - Removed the duplicate sidebar logout button (allowing header dropdown navigation logout), freeing up width on the right column for booking and food orders history tables.
- Café Menu Card Details, Category Grid Split, Experience Pictures Overlay Removal, and Privacy Policy Footer Alignment:
  - Modified `MenuPageClient.tsx` to remove the paragraph rendering `{item.description}` from the café menu card.
  - Redesigned `.horizontal-category-nav` inside `app/(public)/menu/page.css` as a grid with 6 columns on desktop, 3 columns on tablet, and 2 columns on mobile. This wraps the 12 items perfectly into 2 rows of 6 on desktop, while remaining responsive and proportional.
  - Modified `app/(public)/features/page.tsx` to remove the desaturating `coming-soon-img` class and the overlay elements from the Walk-in Experience showcase images.
  - Extracted inline styling from `app/(public)/privacy/page.tsx` into a dedicated stylesheet `app/(public)/privacy/page.css` and repositioned the "Last updated on:" text to the bottom-right corner using a flexbox container.
- Header Navigation Booking Icon Addition:
  - Added a calendar event icon (`calendar_month`) next to the café cart button in the top navigation header inside `components/HeaderNav.tsx` for both desktop and mobile layouts.
  - Linked the new booking button directly to the room booking wizard flow `/book` (which is protected by auth middleware).
  - Updated `app/(public)/layout.css` to define the shared visual styles for `.nav-booking-btn` (hover background, alignment, transition) alongside the existing `.nav-cart-btn`.
- Header Dropdown Consolidation & Settings Password Form:
  - Simplified the desktop and mobile account dropdown menus inside `components/HeaderNav.tsx` by replacing the separate "My Bookings" and "My Orders" links with a single "My Account" option (linking directly to `/account`).
  - Added a "Settings" option to the account dropdowns (linking to `/account?tab=settings`).
  - Created a client-side component `SettingsTab.tsx` inside `app/(customer)/account/SettingsTab.tsx` providing a secure password change form using the browser-based Supabase authentication client. Included current password verification (re-authenticating the user with `signInWithPassword`) and password strength validation rules.
  - Updated `AccountTabs.tsx` to handle a third tab selection `settings`, rendering the Settings tab next to Past Visits & Bookings and Past Food Orders. Also aligned the empty state texts in `BookingsTab.tsx` and `OrdersTab.tsx` to match the "Past" naming convention.
  - Enforced the same strong password validation rules (minimum 8 characters, requiring uppercase, lowercase, numbers, and special characters) during new user signup registration in `app/(auth)/login/page.tsx`, displaying a cohesive requirements helper text under the input field.
  - Enabled `enable_confirmations = true` in Supabase's `config.toml` to enforce signup email verification. Added a 6-digit confirmation code (OTP) entry and verification form (using `supabase.auth.verifyOtp` and `resend`) directly on the signup screen.
- Image Asset Customization & Dynamic Room Showcase:
  - Staged 8 local high-quality Croffle gallery images under `public/images/croffles/`.
  - Suppressed hydration mismatch warnings from browser-autofill extensions by adding `suppressHydrationWarning={true}` on inputs, selects, and action buttons in `MenuManagementClient` and `MenuItemCard`.
  - Connected the homepage preview, rooms catalog, and details pages to render dynamic room photos (`room.image_url`) uploaded from the admin panel, supported by database types extension.
  - Adjusted the homepage hero overlay CSS by replacing the dark brown primary background overlay and vignette gradient with clean, semi-transparent black overlays to preserve natural photo colors.
  - Linked walk-in experience image tags on both the homepage and experiences showcase to local custom images (`cat.png`, `pool.png`, `booth.png`).
- Staff Gating & Public Access Middleware Polish:
  - Refactored `middleware.ts` to permit staff/admin members to browse public-facing read-only pages (like `localhost:3000`, `/rooms`, `/menu`) while strictly gating them from transactional customer screens (`/book`, `/cart`, `/account`, `/login`, `/register`) by redirecting them back to their dashboards.
- Pre-Deployment Checklist Coordinates and Location Verification:
  - Verified and confirmed physical address, phone, email, and Google Maps embed for Point 6 (Real Location Details) on the pre-deployment checklist.
  - Verified that Aizawl coordinates match at `23.7342, 92.7214` in both `location/page.tsx` and `radiusCheck.ts` for Point 7 (Delivery Radius).
  - Confirmed the post-deployment strategy for updating seeded admin and staff credentials directly via the Supabase Auth Dashboard (Authentication -> Users).