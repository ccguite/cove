# Spec: Unit 15 — Admin: Revenue Report

## Goal

Build the admin-only revenue and operations reports page under `app/(dashboard)/dashboard/reports/` that queries, aggregates, and renders financial and transaction KPIs (All-Time Revenue, Month-to-Date Revenue, Confirmed Bookings count, and Placed Food Orders count) along with a daily breakdown ledger for the current month, enforcing strict admin role restrictions.

---

## Design

The reports dashboard is styled based on the **Seoul Serenity** theme, mirroring the cards and table structures in `UI_DESIGN/admin_overview_cove/code.html`:
- **KPI Summary Grid**: Top row displaying four elevated metric panels using `--color-surface-container-lowest` backgrounds and hover translation animations:
  1. **Total Revenue (All Time)**: Sum of confirmed room rentals and completed food orders with a `payments` icon.
  2. **MTD Revenue (Current Month)**: Financial aggregates for the current calendar month with a trending-up indicator.
  3. **Total Bookings**: Total count of confirmed space reservations with a `meeting_room` icon.
  4. **Total Food Orders**: Total count of standalone takeaway and delivery orders with a `room_service` icon.
- **Monthly Operations Table**: A detailed list layout displaying daily transactional aggregates for the current month. Columns:
  - **Date**: Format `Oct 27, 2026`
  - **Space Bookings**: Count of room reservations confirmed on that day
  - **Room Revenue**: Combined earnings from room rentals (₹)
  - **Food Orders**: Count of standalone orders placed on that day
  - **Food Revenue**: Combined earnings from standalone orders (₹)
  - **Total Revenue**: Sum of room and food revenue for that day (bold primary text)

---

## Implementation

### Folder Layout
Create the files in the following boundary positions:

```
cove/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── reports/
│               └── page.tsx                # Admin Reports Page (React Server Component)
└── lib/
    └── admin/
        └── reportService.ts                # Revenue aggregation logic (Server only)
```

---

### Core Query Aggregations — `lib/admin/reportService.ts`
Implement database queries using the Supabase Server Client:

```ts
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

export interface ReportKPIs {
  totalRevenueAllTime: number;
  mtdRevenue: number;
  totalBookingsCount: number;
  totalOrdersCount: number;
}

export interface DailyLedgerRow {
  date: string;
  bookingsCount: number;
  bookingsRevenue: number;
  ordersCount: number;
  ordersRevenue: number;
  totalRevenue: number;
}

/**
 * Aggregates all revenue, bookings, and standalone orders statistics server-side.
 */
export async function getRevenueReportData(): Promise<{ kpis: ReportKPIs; ledger: DailyLedgerRow[] }> {
  const supabase = createSupabaseServerClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Fetch bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('created_at, total_price, status')
    .eq('status', 'confirmed');

  // 2. Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('created_at, total_price, status')
    .in('status', ['placed', 'preparing', 'ready', 'dispatched', 'collected']);

  const safeBookings = bookings || [];
  const safeOrders = orders || [];

  // Compute KPIs
  const totalBookingsCount = safeBookings.length;
  const totalOrdersCount = safeOrders.length;
  
  const totalBookingsRevenue = safeBookings.reduce((sum, b) => sum + b.total_price, 0);
  const totalOrdersRevenue = safeOrders.reduce((sum, o) => sum + o.total_price, 0);
  const totalRevenueAllTime = totalBookingsRevenue + totalOrdersRevenue;

  // Month-to-Date Calculations
  const mtdBookings = safeBookings.filter(b => b.created_at >= startOfMonth);
  const mtdOrders = safeOrders.filter(o => o.created_at >= startOfMonth);
  const mtdRevenue = mtdBookings.reduce((sum, b) => sum + b.total_price, 0) + 
                     mtdOrders.reduce((sum, o) => sum + o.total_price, 0);

  // Compile Daily Ledger for current month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const ledgerMap = new Map<string, DailyLedgerRow>();

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    ledgerMap.set(dayStr, {
      date: dayStr,
      bookingsCount: 0,
      bookingsRevenue: 0,
      ordersCount: 0,
      ordersRevenue: 0,
      totalRevenue: 0
    });
  }

  // Populate ledger data
  safeBookings.forEach(b => {
    const dateKey = b.created_at.split('T')[0];
    if (ledgerMap.has(dateKey)) {
      const row = ledgerMap.get(dateKey)!;
      row.bookingsCount += 1;
      row.bookingsRevenue += b.total_price;
      row.totalRevenue += b.total_price;
    }
  });

  safeOrders.forEach(o => {
    const dateKey = o.created_at.split('T')[0];
    if (ledgerMap.has(dateKey)) {
      const row = ledgerMap.get(dateKey)!;
      row.ordersCount += 1;
      row.ordersRevenue += o.total_price;
      row.totalRevenue += o.total_price;
    }
  });

  const ledger = Array.from(ledgerMap.values()).reverse(); // Newest first

  return {
    kpis: {
      totalRevenueAllTime,
      mtdRevenue,
      totalBookingsCount,
      totalOrdersCount
    },
    ledger
  };
}
```

---

### Page Component — `app/(dashboard)/dashboard/reports/page.tsx`
- **Role Verification**:
  - Authenticates the current session.
  - Queries `users` to confirm `role === 'admin'`. If not, redirects to `/` or throws an authorization error.
- **Rendering Layout**:
  - Renders the KPI card grid with icons (`payments`, `meeting_room`, `room_service`, `pie_chart`).
  - Renders the Daily operations table iterating over the `ledger` array.

---

## Dependencies

No extra packages to install. Built-in JS Date functions handle current-month coordinate ranges.

---

## Verification Checklist

### Admin Access Lock
- [ ] Users without an active session are redirected to `/login?next=/dashboard/reports`.
- [ ] Logged-in users with a `staff` role attempting to load `/dashboard/reports` are blocked/redirected to `/dashboard` by the page handler.
- [ ] Only logged-in users with the `admin` role can view page contents.

### KPI Statistics
- [ ] Total Revenue card displays the accurate mathematical sum of all confirmed bookings and placed orders.
- [ ] MTD Revenue card correctly filters and aggregates transactions starting from the 1st of the current month.
- [ ] Bookings and Orders counts match the exact number of verified database entries.

### Daily Breakdown Ledger
- [ ] Displays rows for each day of the current calendar month in descending order (newest first).
- [ ] Calculates separate counts and sums for room rentals and standalone orders per day.
- [ ] Row totals accurately represent the sum of room revenue + food revenue.
- [ ] Empty days populate with 0 counts/amounts.
