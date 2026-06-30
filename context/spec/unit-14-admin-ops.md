# Spec: Unit 14 — Admin Manual Slot Blocking & Staff Account Management

## Goal

Build two administrative dashboard interfaces under `app/(dashboard)/dashboard/slots/` (for manual room slot blocking to make hourly intervals unavailable to customers with reasons) and `app/(dashboard)/dashboard/staff/` (for creating staff credentials securely using the Supabase Admin Auth API and updating existing users' operational roles), ensuring all write requests assert the admin privilege server-side.

---

## Design

The administrative panels are styled in alignment with the **Seoul Serenity** design system and the layout cards in `UI_DESIGN/room_management_cove_admin/code.html`. 

### 1. Slot Blocking Panel (`/dashboard/slots`)
- **Active Overview Grid**: Lists bookable rooms (Husk / Haven) side-by-side with current status banners (`Occupied`, `Available`, `Cleaning Needed`).
- **Create Manual Block Form**: An inline card layout where the admin selects:
  - Space (Husk / Haven)
  - Date (datepicker)
  - Start Time (hour dropdown)
  - Duration (1–5 hours slider/dropdown)
  - Reason (text input, e.g. "Maintenance", "Private VIP Event")
- **Timeline / Active Blocks List**: A list displaying all active manual blocks with their date, time window, room, and reason, with an **Unblock** action button styled using `--color-error` borders.

### 2. Staff Management Panel (`/dashboard/staff`)
- **Operational Users Table**: Lists all active profiles where `role` is `'staff'` or `'admin'`. Columns:
  - Name & Email (in primary text)
  - Role Badge (`Staff` / `Admin`)
  - Date Added
  - Action button (`Edit Role`)
- **Add New Staff Member Form**: An elevated card prompting inputs for:
  - Full Name (text)
  - Email Address (email)
  - Initial Password (password)
  - Role Select (Staff / Admin dropdown)
  - **Submit Button**: Labeled `Create Staff Account` using `--color-primary` background.

---

## Implementation

### Folder Layout
Create the files in the following boundary positions:

```
cove/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── slots/
│   │       │   └── page.tsx                # Slot Blocking Page (React Server Component)
│   │       └── staff/
│   │           └── page.tsx                # Staff Account Management Page (RSC)
│   └── api/
│       └── admin/
│           ├── slots/
│           │   ├── block/
│           │   │   └── route.ts            # Insert manual block API
│           │   └── unblock/
│           │       └── route.ts            # Delete manual block API
│           └── staff/
│               ├── create/
│               │   └── route.ts            # Create Auth user + Profile row API
│               └── role/
│                   └── route.ts            # Change user role API
```

---

### API Endpoint Interfaces

#### 1. Block Slot Endpoint — `/api/admin/slots/block`
- **Method**: `POST`
- **Payload**: `{ roomId, date, startTime, durationHours, reason }`
- **Logic**:
  - Validates inputs. Enforces operating boundaries (cannot extend past 11:00 PM).
  - Inserts row into `blocked_slots`.

#### 2. Unblock Slot Endpoint — `/api/admin/slots/unblock`
- **Method**: `POST` (or `DELETE`)
- **Payload**: `{ blockId }`
- **Logic**:
  - Deletes matching row from `blocked_slots`.

#### 3. Create Staff Account Endpoint — `/api/admin/staff/create`
- **Method**: `POST`
- **Payload**: `{ email, password, name, role }`
- **Logic**:
  - Instantiates the Supabase Service-Role client (`createSupabaseServiceClient()`) to bypass public signup limitations.
  - Calls `supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } })`.
  - If successful, inserts/updates the user profile row in the `users` table mapping the generated UUID to:
    - `{ name, email, role: 'staff' | 'admin' }`.
  - Returns success status.

#### 4. Update Role Endpoint — `/api/admin/staff/role`
- **Method**: `PATCH`
- **Payload**: `{ userId, role }`
- **Logic**:
  - Updates the `role` column in the `users` table for the specified user.

---

### Core Query logic

#### 1. Checking Block Conflicts in Customer Booking Flow
When checking available slots inside `/api/bookings/available-slots` and `/api/bookings/lock`, the query must inspect the `blocked_slots` table in addition to `bookings` and `slot_locks`.
```ts
const { data: blocks } = await supabase
  .from('blocked_slots')
  .select('start_time, duration_hours')
  .eq('room_id', roomId)
  .eq('date', date);
```

#### 2. Querying Staff Members
```ts
const { data: staffList } = await supabase
  .from('users')
  .select('*')
  .in('role', ['staff', 'admin'])
  .order('name', { ascending: true });
```

---

## Dependencies

No extra packages to install. Relies on standard Supabase Server Admin Auth methods enabled via the `SUPABASE_SERVICE_ROLE_KEY`.

---

## Verification Checklist

### Authorization Checks
- [ ] Non-admin accounts (e.g. staff and customers) attempting to visit `/dashboard/slots` or `/dashboard/staff` are blocked by middleware.
- [ ] Directly hitting `/api/admin/slots/*` or `/api/admin/staff/*` endpoints from a customer/staff browser returns a `403 Forbidden` error.

### Slot Blocking Features
- [ ] Submitting a manual block inserts a row into `blocked_slots`.
- [ ] Active blocks appear in the timeline queue listing dates, rooms, and reasons.
- [ ] Clicking "Unblock" removes the database row and refreshes the list.
- [ ] **Customer UI Conflict**: When a slot is manually blocked by the admin, visiting `/book` for that room and date displays the blocked hourly slots as disabled (greyed-out) chips, preventing checkout.

### Staff Credentials Creation
- [ ] Creating a staff member triggers the Supabase Admin SDK user creation flow.
- [ ] The generated user has their email pre-confirmed (`email_confirm: true`) so they can log in immediately.
- [ ] A matching row is inserted in `public.users` with the correct role (`staff` or `admin`).
- [ ] The newly created staff account can log in via `/login` and access `/dashboard` operations.

### Staff Role Modifications
- [ ] Changing an existing user's role updates their row in the `users` table.
- [ ] Demoting a user to `customer` immediately revokes their dashboard routing credentials.
