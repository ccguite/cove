# COVE — Code Standards

## Overview

This document defines the coding conventions, patterns, and rules for the COVE codebase. It applies to all contributors. The stack is **Next.js 14 (App Router)**, **TypeScript**, **Vanilla CSS**, **Supabase**, and **Razorpay**. When in doubt, favour explicitness, readability, and consistency over cleverness.

---

## 1. Language and TypeScript

- **TypeScript is mandatory** across the entire codebase. JavaScript files (`.js`, `.jsx`) are not permitted.
- Set `"strict": true` in `tsconfig.json`. Never disable strict mode for individual files.
- **No `any`**. If a type is genuinely unknown, use `unknown` and narrow it. If a third-party library forces `any`, isolate it in a wrapper and type the wrapper's output.
- **Always type function return values** on API routes, server actions, and `lib/` utilities. React component return types can be inferred.
- Use `type` for object shapes and unions. Use `interface` only when you need declaration merging (rarely).
- Enums are forbidden. Use `as const` objects and derive types from them.

```ts
// ✅ Correct
const ORDER_STATUS = {
  PLACED: 'placed',
  PREPARING: 'preparing',
  READY: 'ready',
  DISPATCHED: 'dispatched',
  COLLECTED: 'collected',
} as const;

type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ❌ Forbidden
enum OrderStatus { Placed, Preparing, Ready }
```

- Export types from a `types.ts` file inside the relevant `lib/` subdirectory. Never define shared types inside component files.

---

## 2. File and Folder Naming

| Thing | Convention | Example |
|---|---|---|
| Directories | `kebab-case` | `booking-food-items/` |
| Page files | `page.tsx` (Next.js convention) | `app/(customer)/book/page.tsx` |
| Layout files | `layout.tsx` | `app/(dashboard)/layout.tsx` |
| API route files | `route.ts` | `app/api/razorpay/webhook/route.ts` |
| Component files | `PascalCase.tsx` | `components/ui/Button.tsx` |
| Utility / logic files | `camelCase.ts` | `lib/booking/slotValidator.ts` |
| Type definition files | `types.ts` | `lib/booking/types.ts` |
| CSS files | `kebab-case.css` | `styles/booking-flow.css` |
| Test files | `*.test.ts` or `*.test.tsx` | `lib/booking/slotValidator.test.ts` |

- One component per file. No barrel files (`index.ts` re-exports) inside `components/`.
- Do not abbreviate names. `deliveryRadiusCheck.ts` not `dlvRdChk.ts`.

---

## 3. Component Rules

- **No business logic inside components.** Components handle layout, rendering, and user events only. All business logic lives in `lib/`.
- **No direct Supabase queries inside components.** Data is fetched in Server Components or passed as props. Client Components receive data via props or React Context.
- **No inline styles.** All styling uses CSS classes defined in `styles/`. The `style` attribute is forbidden except for dynamic CSS custom property values (e.g., `style={{ '--progress': '75%' }}`).
- Components are either Server Components (default) or explicitly marked `'use client'`. Never add `'use client'` unless the component genuinely needs browser APIs or React hooks (`useState`, `useEffect`, etc.).
- Keep components small. If a component's JSX exceeds ~80 lines, extract sub-components.

```tsx
// ✅ Correct — data fetched in Server Component, passed as props
// app/(public)/menu/page.tsx
import { getMenuItems } from '@/lib/menu/menuService';
import { MenuGrid } from '@/components/shared/MenuGrid';

export default async function MenuPage() {
  const items = await getMenuItems();
  return <MenuGrid items={items} />;
}

// ❌ Forbidden — Supabase query inside a component
'use client';
import { supabase } from '@/lib/supabase/browserClient';

export function MenuGrid() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    supabase.from('menu_items').select('*').then(...); // ❌
  }, []);
}
```

---

## 4. Supabase Usage

- **Two Supabase clients exist and must never be swapped:**

| Client | File | Key Used | Used In |
|---|---|---|---|
| Browser client | `lib/supabase/browserClient.ts` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `'use client'` components, Realtime subscriptions |
| Server client | `lib/supabase/serverClient.ts` | `SUPABASE_SERVICE_ROLE_KEY` | API routes, Server Components, Server Actions |

- The `SUPABASE_SERVICE_ROLE_KEY` must **never** appear in any file that runs in the browser. It is server-only.
- All database writes that require elevated permissions (e.g., confirming a booking after payment) must go through an API route using the server client — never from the browser.
- **Always handle Supabase errors explicitly.** Never assume a query succeeded.

```ts
// ✅ Correct
const { data, error } = await supabase.from('menu_items').select('*');
if (error) throw new Error(`Failed to fetch menu items: ${error.message}`);

// ❌ Forbidden — ignoring the error
const { data } = await supabase.from('menu_items').select('*');
```

- Supabase queries belong in `lib/` service files, not in route handlers or components directly.

```ts
// ✅ Correct — query lives in lib/menu/menuService.ts
export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await serverClient.from('menu_items').select('*');
  if (error) throw new Error(error.message);
  return data;
}
```

---

## 5. API Routes

- All API routes live under `app/api/`. No API logic belongs in page files.
- Every route handler must be typed using Next.js's `NextRequest` and `NextResponse`.
- **Consistent response shape** for all routes — always return `{ data }` on success or `{ error }` on failure:

```ts
// ✅ Success
return NextResponse.json({ data: booking }, { status: 200 });

// ✅ Error
return NextResponse.json({ error: 'Slot is unavailable' }, { status: 409 });

// ❌ Inconsistent — do not mix shapes
return NextResponse.json({ booking, message: 'ok' });
```

- **Always validate input** at the top of a route handler before any DB or payment calls. Return `400` immediately on invalid input. Use `zod` for schema validation.
- **Always authenticate** the session at the top of protected routes before any other logic.
- Never trust client-supplied prices, totals, or roles. Re-derive all sensitive values server-side.

```ts
// ✅ Correct pattern for a protected API route
export async function POST(req: NextRequest) {
  // 1. Authenticate
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  // 2. Validate input
  const body = await req.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // 3. Business logic
  // 4. Return response
}
```

---

## 6. Authentication and Role Checks

- Session reading is done **server-side only** using Supabase SSR helpers. Never read `localStorage` or `document.cookie` to determine a user's role.
- Role checks in route handlers must read `role` from the `users` table via the server client, not from the JWT claims. JWT claims are a secondary signal only.
- **Never perform a role check inside a component.** Use Next.js Middleware to redirect unauthorised users before the page renders.
- Middleware protects the following route groups:
  - `/(customer)/*` — requires any authenticated session
  - `/(dashboard)/*` — requires `role = 'staff'` or `role = 'admin'`
  - `/(dashboard)/menu/*`, `/(dashboard)/staff/*`, `/(dashboard)/slots/*` — requires `role = 'admin'`

---

## 7. CSS and Styling

- All design tokens (colours, spacing, font sizes, border radii) are defined as CSS custom properties in `styles/tokens.css` and must never be hardcoded anywhere else.

```css
/* ✅ Correct */
background-color: var(--color-surface);
padding: var(--spacing-4);

/* ❌ Forbidden — hardcoded values */
background-color: #3b2a1a;
padding: 16px;
```

- Class names use `kebab-case`. No camelCase, no BEM double-underscores unless adopting BEM consistently across the whole project.
- No `!important`. If you need it, the CSS structure is wrong — fix the specificity instead.
- No inline `style` attributes except for dynamic CSS custom property assignment.
- Media queries use the tokens defined in `styles/tokens.css`. Breakpoints are not magic numbers scattered across files.
- Animations must respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-fade {
    animation: none;
  }
}
```

---

## 8. Error Handling

- All `async` functions in `lib/` must either return a typed result or throw a descriptive `Error`. Never silently swallow exceptions.
- API routes must catch all thrown errors and return a structured `{ error: string }` response with an appropriate HTTP status code. Unhandled promise rejections in API routes are forbidden.
- Client-side errors shown to users must be human-readable. Never expose raw Supabase error messages, stack traces, or internal field names to the UI.
- Use a top-level `error.tsx` in each route group to handle unexpected render errors gracefully.

```ts
// ✅ Correct — explicit, rethrows with context
export async function confirmBooking(bookingId: string): Promise<void> {
  const { error } = await serverClient
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId);
  if (error) throw new Error(`confirmBooking failed for ${bookingId}: ${error.message}`);
}
```

---

## 9. Environment Variables

- All environment variables are declared in `.env.local` (local dev) and Vercel's environment variable panel (production).
- Variable naming convention:
  - `NEXT_PUBLIC_` prefix for variables that are safe to expose to the browser.
  - No prefix for server-only variables.
- **No `NEXT_PUBLIC_` prefix on secrets.** The following are server-only and must never be prefixed:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`
- A `.env.example` file must be kept up to date in the repository with all required variable names but no values.
- Never commit `.env.local` to version control. It must be listed in `.gitignore`.

---

## 10. Git and Version Control

- **Branch naming**: `feature/<short-description>`, `fix/<short-description>`, `chore/<short-description>`
  - Example: `feature/room-booking-flow`, `fix/slot-overlap-check`, `chore/update-dependencies`
- **Commit message format**: imperative mood, present tense, 72 character limit on the subject line.
  - ✅ `Add slot-locking logic to booking API route`
  - ❌ `Added slot locking`, `fixed bug`, `WIP`
- `main` is the production branch. All work is done on feature branches and merged via pull request.
- Do not commit directly to `main`.
- Every pull request must have at least one passing CI check before merge (lint + type check).

---

## 11. Testing

- Business logic in `lib/` must have unit tests. UI components do not need unit tests in v1.
- Test files sit next to the file they test: `lib/booking/slotValidator.test.ts` tests `lib/booking/slotValidator.ts`.
- Use **Vitest** as the test runner (compatible with Vite-style imports, works without a browser).
- Each test file must cover:
  - The happy path (valid input → correct output)
  - At least two edge cases or boundary conditions
  - At least one invalid input case (should throw or return an error)
- The following functions require tests before the feature is considered complete:
  - `slotValidator` — overlap detection, 11PM cutoff, 5-hour max duration, Haven minimum pax
  - `deliveryRadiusCheck` — within radius, exactly on boundary, outside radius
  - `calculateBookingTotal` — correct price per room type, duration multiplication
  - `calculateOrderTotal` — correct sum, minimum order enforcement
  - Razorpay webhook HMAC signature verification

---

## 12. What Not to Do

A direct list of patterns that are banned in this codebase:

| Pattern | Why It Is Banned |
|---|---|
| `any` type | Defeats TypeScript's purpose; hides bugs |
| Inline styles (except dynamic CSS vars) | Bypasses the design token system |
| Supabase service role key in browser code | Security — exposes full DB access to the client |
| Client-supplied price trusted by the server | Security — allows customers to manipulate payment amounts |
| Setting `bookings.status = 'confirmed'` outside the Razorpay webhook handler | Allows unpaid bookings to be confirmed |
| Direct DB queries inside React components | Violates the separation of concerns boundary |
| Hardcoded pixel values or colour hex codes in CSS | Violates the design token system |
| `console.log` left in committed code | Use a logger utility or remove before committing |
| `.env.local` committed to Git | Exposes secrets |
| Magic numbers in business logic | Use named constants in `lib/` with comments explaining their origin |
