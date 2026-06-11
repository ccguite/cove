# COVE — Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

Implementation

## Current Goal

Implement Unit 9: Room Booking Flow (Customer UI + API + Payment)

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
- Unit 8: Booking Slot Validation Logic + Tests — Built core room booking validation functions inside `lib/booking/slotValidator.ts` and verified with a comprehensive unit test suite in `lib/booking/slotValidator.test.ts` running on Vitest.

## In Progress

- Unit 9: Room Booking Flow (Customer UI + API + Payment)
  - Stepper form booking wizard under app/(customer)/book/
  - available-slots, slot lock, and order creation API endpoints
  - signature-verified Razorpay payment webhook endpoint under app/api/razorpay/webhook/

## Next Up

- Unit 10: Delivery Radius Logic + Food Order Flow (UI + API + Payment)

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
- Next developer should proceed with Unit 5 (Public Rooms Page).