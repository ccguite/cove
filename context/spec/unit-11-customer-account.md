# Spec: Unit 11 — Customer Account (Booking & Order History)

## Goal

Build the customer account page under `app/(customer)/account/` featuring an interactive tabbed interface that displays the authenticated customer's confirmed bookings history (including room names, schedules, durations, guests, pre-ordered food, and totals) and standalone food order history (including order type, menu item lists, grand totals, and delivery/takeaway statuses), alongside their profile sidebar and editable personal details.

---

## Design

The customer account interface is styled using the **Seoul Serenity** theme. The layout consists of a responsive grid matching `UI_DESIGN/my_dashboard_cove/code.html` that shifts from a single-column layout on mobile to a two-column layout on desktop:
- **Left Column (Desktop Sidebar / Mobile Top)**: Contains the Profile Card (avatar, customer name, phone number, and count indicators for active bookings) and the Logout action button.
- **Right Column (Desktop Main / Mobile Bottom)**: Main content area consisting of:
  - **Tabs Bar**: A tab toggle container with two buttons: **Visits & Bookings** and **Food Orders**.
  - **Active Tab Panel**:
    - **Visits & Bookings Panel**: Displays cards for confirmed room reservations. Each card features a calendar-styled day block (e.g. Month + Day number), room name, duration details, guest count, price, and an inline lists container detailing any pre-ordered food items.
    - **Food Orders Panel**: Displays a table of standalone café orders featuring the order date, type (Takeaway / Delivery with icon helpers), itemized menu list, total cost, and a status badge.
  - **Personal Details Section**: Form containing fields for the user's Full Name (editable), Email (disabled, marked as login identifier), and Phone Number (editable, formatted for 10 digits).

### UI Color & Component Mappings
- **Active Tab Button**: Uses `--color-secondary-container` background with `--color-primary` text and bold font-weight.
- **Inactive Tab Button**: Transparent background with `--color-text-secondary` text, adding hover backgrounds (`--color-surface-low`).
- **Calendar Tile**: Styled with `--color-surface-low` background, displaying the Month in `--color-text-secondary` uppercase and the Day in a large `--text-size-headline-md` number.
- **Status Badges**:
  - `Confirmed` / `Placed`: Uses `--color-success-container` background and `--color-success` text.
  - `Preparing` / `Dispatched`: Uses `--color-warning-container` background and `--color-warning` text.
  - `Ready` / `Delivered` / `Collected`: Uses `--color-surface-variant` background and `--color-text-secondary` text.
- **Pre-order Items List**: Rendered as a small bulleted or inline stack inside the booking card with light borders using `--color-border-subtle`.

---

## Implementation

### Folder Layout
Create/modify the files in the following boundary positions:

```
cove/
├── app/
│   ├── (customer)/
│   │   └── account/
│   │       ├── page.tsx                    # Next.js Server Component (Data fetching)
│   │       ├── account.css                 # Main stylesheet with tab definitions
│   │       ├── AccountTabs.tsx             # Client Component managing active tab state
│   │       ├── BookingsTab.tsx             # Sub-component rendering booking cards
│   │       └── OrdersTab.tsx               # Sub-component rendering recent orders
│   └── api/
│       └── account/
│           └── profile/
│               └── route.ts                # Profile update route (already exists)
```

---

### Database Queries & joins
All queries are executed server-side via the Supabase Server client, automatically scoped by database Row-Level Security (RLS) rules:

#### 1. Bookings Fetch Query
```ts
const { data: bookings, error } = await supabase
  .from('bookings')
  .select(`
    *,
    rooms (name, slug),
    booking_food_items (
      quantity,
      unit_price,
      menu_items (name)
    )
  `)
  .eq('user_id', session.user.id)
  .order('date', { ascending: false });
```

#### 2. Orders Fetch Query
```ts
const { data: orders, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      quantity,
      unit_price,
      menu_items (name)
    )
  `)
  .eq('user_id', session.user.id)
  .order('created_at', { ascending: false });
```

---

### Server Page — `app/(customer)/account/page.tsx`
- **Session Authentication**: Checks for the active Supabase auth session. If absent, redirects to `/login?next=/account`.
- **Parallel Data Fetching**:
  - Fetches the user profile from the `users` table.
  - Fetches user bookings (with room name joins and pre-ordered food item joins).
  - Fetches user orders (with order item joins).
- **Structure Passing**:
  - Compiles statistics (e.g. Total Bookings count).
  - Passes fetched list structures as props down into `AccountTabs`.

---

### Client Tabs Component — `app/(customer)/account/AccountTabs.tsx`
- Marked with `'use client'`.
- **States**:
  - `activeTab`: `'bookings' | 'orders'` (default `'bookings'`).
- **Layout**:
  - Renders the tab selectors in a container above the main panel.
  - Renders `BookingsTab` when `activeTab === 'bookings'`.
  - Renders `OrdersTab` when `activeTab === 'orders'`.

---

### Bookings Panel — `app/(customer)/account/BookingsTab.tsx`
- Marked with `'use client'`.
- Receives the `bookings` array from props.
- If empty: Renders the custom empty state layout matching `account.css` with a "Book a Room" CTA button.
- If present: Iterates over the bookings list, rendering a card layout:
  - Renders calendar date block on the top-right.
  - Renders room name and status badge on the left.
  - Lists guest counts, duration, and scheduled time interval.
  - Iterates over `booking_food_items` to list pre-orders in an accordion or structured panel:
    - Example: `• 1x Cold Brew (₹220)`
  - Displays the grand total paid.
  - *Constraint Check*: The "Cancel" and "Manage" buttons shown in `code.html` are omitted as cancellation logic is out-of-scope for v1.

---

### Orders Panel — `app/(customer)/account/OrdersTab.tsx`
- Marked with `'use client'`.
- Receives the `orders` array from props.
- If empty: Renders the custom empty state layout matching `account.css` with an "Order Food" CTA button.
- If present: Renders a structured history table with the following headers:
  - **Date**: Formatted string (e.g. `Oct 15, 2026`).
  - **Type**: Displays an inline icon indicating takeaway (`shopping_bag`) or delivery (`local_shipping`).
  - **Items**: Comma-separated list displaying item name and quantity (e.g. `Croffle x 2, Flat White x 1`).
  - **Total**: Displays the price snapshotted on the order row formatted in Rupees (e.g. `₹490`).
  - **Status**: Renders a styled status badge based on `orders.status` (`placed`, `preparing`, `ready`, `dispatched`, `collected`).

---

### Styles — `app/(customer)/account/account.css`
Define CSS classes to style the tab components using design tokens:

```css
/* Tab Buttons Container */
.account-tabs {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: var(--space-2);
}

.account-tab-btn {
  background: transparent;
  border: none;
  font-family: var(--font-body);
  font-size: var(--text-size-label-md);
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.account-tab-btn:hover {
  background-color: var(--color-surface-low);
  color: var(--color-text-primary);
}

.account-tab-btn.active {
  background-color: var(--color-secondary-container);
  color: var(--color-primary);
  font-weight: 600;
}

/* Booking Card Pre-orders List styling */
.booking-food-preorders {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px dashed var(--color-border-subtle);
}

.preorder-title {
  font-family: var(--font-body);
  font-size: var(--text-size-label-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  margin-bottom: var(--space-2);
}

.preorder-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.preorder-item {
  font-family: var(--font-body);
  font-size: var(--text-size-body-sm);
  color: var(--color-text-primary);
}

/* Orders Table Column Widths */
.orders-table th, 
.orders-table td {
  padding: var(--space-4);
  text-align: left;
}

.orders-table td.order-total-col {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-text-primary);
}
```

---

## Dependencies

No extra packages to install. Integrates directly with existing `@supabase/ssr` modules.

---

## Verification Checklist

### Authentication & Redirection
- [ ] Visiting `/account` with an unauthenticated session redirects the customer to `/login?next=/account`.
- [ ] User profile variables (Name, Phone number) fetch and populate correctly inside the Sidebar Profile card.

### Tabs Navigation
- [ ] Renders tab controls for **Visits & Bookings** and **Food Orders**.
- [ ] Clicking a tab header switches the active pane and highlights the active tab with active classes (`.active`).
- [ ] Personal details form remains static and visible below the active tab pane.

### Bookings History
- [ ] Empty state renders if the bookings array is empty, showing a "Book a Room" button.
- [ ] Booking card displays the room name, calendar day, time frame, guest count, and snapshotted total price.
- [ ] Booking card lists any pre-ordered menu items with their quantities.
- [ ] Renders the correct confirmation badge (`Confirmed` / `Pending Payment`).

### Standalone Orders History
- [ ] Empty state renders if the food orders array is empty, showing an "Order Food" button.
- [ ] Orders table displays takeaway/delivery mode icons next to dates.
- [ ] Items column renders a clean comma-separated list of purchased items (e.g. `Americano x 1, Pastry x 2`).
- [ ] Grand total renders snapshotted price formatted in Rupees.
- [ ] Order status column matches status badges (`Placed` / `Preparing` / `Ready` / `Dispatched` / `Collected`).
