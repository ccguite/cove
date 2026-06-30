# Spec: Unit 12 — Staff Dashboard (Orders, Bookings & Real-time Notifications)

## Goal

Build the internal operations staff dashboard under `app/(dashboard)/dashboard/` featuring real-time orders tracking (with preparing, ready, and dispatch state transitions), today's confirmed room reservations list (including guest details, times, and pre-ordered meals), dynamic room status displays, and instant floating audio-visual notifications powered by Supabase Realtime subscriptions.

---

## Design

The staff operations interface utilizes the **Seoul Serenity** design system. The page displays a fixed sidebar on desktop and a bottom navigation bar on mobile, rendering a 2-column operations layout:
- **Left Column (Diner & Food Orders)**: Lists all active food orders (excluding completed takeaways/deliveries) in a cards format. Each card displays:
  - Header showing target location (e.g. `HUSK Room`, `Table 04`, `Takeaway`, or `Delivery`).
  - Unique ID (e.g. `Order #1024`) with an elapsed timer highlighting duration since creation.
  - List of ordered menu items with quantities.
  - Quick action buttons to transition order status: `Prepare` (placed → preparing), `Ready` (preparing → ready), and `Complete` (ready → collected/delivered).
- **Right Column (Room Status & Arrivals)**:
  - **Room Status Board**: Displays Husk and Haven states (Occupied / Available / Cleaning Needed). Status is calculated dynamically based on today's reservations and manual admin blocks.
  - **Daily Arrivals List**: Displays a chronological list of today's incoming bookings, guest names, party sizes, start hours, and a "Check In" button.
- **Real-time Notifications Overlay**:
  - A hidden client-side listener that triggers a sliding floating Toast banner (top-right corner) and plays a soft notification tone (`/public/notification.mp3`) when new orders or bookings are confirmed.

### Status Color Codes
- `Dine-in` / `Room Service` tag: Uses `--color-accent-subtle` background with `--color-primary` text.
- `Takeaway` / `Delivery` tag: Uses `--color-secondary-container` background with `--color-text-secondary` text.
- `Occupied` indicator: Uses `--color-error` (soft red) dot.
- `Available` indicator: Uses `--color-success` (soft green) dot.
- `Cleaning Needed` indicator: Uses `--color-warning` (soft amber) dot.

---

## Implementation

### Folder Layout
Create/modify the files in the following boundary positions:

```
cove/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── layout.tsx                  # Wraps dashboard in Realtime listener
│   │       ├── page.tsx                    # Dashboard home (Overview stats)
│   │       ├── orders/
│   │       │   └── page.tsx                # Live Orders queue manager
│   │       ├── bookings/
│   │       │   └── page.tsx                # Today's Bookings and arrivals page
│   │       └── status/
│   │           └── page.tsx                # Room status check page
│   └── api/
│       └── orders/
│           └── status/
│               └── route.ts                # Update order status endpoint
└── public/
    └── notification.mp3                    # Alarm chime asset
```

---

### Database Queries & joins

#### 1. Fetching Active Food Orders
Active food orders exclude completed states (`collected`, `collected` equivalent, or `delivered` takeaways):
```ts
const { data: activeOrders } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      quantity,
      unit_price,
      menu_items (name)
    )
  `)
  .in('status', ['placed', 'preparing', 'ready', 'dispatched'])
  .order('created_at', { ascending: true });
```

#### 2. Fetching Today's Confirmed Bookings & Pre-orders
```ts
const today = new Date().toISOString().split('T')[0];

const { data: todaysBookings } = await supabase
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
  .eq('date', today)
  .eq('status', 'confirmed')
  .order('start_time', { ascending: true });
```

---

### Order Status Transition API — `app/api/orders/status/route.ts`
- **Method**: `PATCH`
- **Authorization**: Restricts updates to sessions where `users.role === 'staff'` or `'admin'`.
- **Payload**: `{ orderId: string, status: string }`
- **Logic**:
  - Updates `orders.status` in the database.
  - Returns the updated order row.
  - Triggers Realtime updates to active dashboard subscribers.

---

### Global Notification Listener — `app/(dashboard)/dashboard/layout.tsx`
Wrap children with a Client Component that mounts a Supabase Realtime channel listener:

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

export default function RealtimeNotificationWrapper({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Subscribe to new confirmed bookings and food orders
    const channel = supabase
      .channel('live-ops-alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.status === 'placed') {
            triggerAlert(`New standalone food order placed! Total: ₹${payload.new.total_price}`);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.new.status === 'confirmed') {
            triggerAlert(`New room booking confirmed for ${payload.new.date}!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerAlert = (msg: string) => {
    setToast({ show: true, message: msg });
    
    // Play alert sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch((e) => console.log('Audio playback prevented:', e));

    // Auto-hide toast
    setTimeout(() => setToast({ show: false, message: '' }), 5000);
  };

  return (
    <>
      {children}
      {toast.show && (
        <div className="floating-dashboard-toast">
          <span className="material-symbols-outlined">notifications</span>
          <p>{toast.message}</p>
        </div>
      )}
    </>
  );
}
```

---

### Live Orders Page — `app/(dashboard)/dashboard/orders/page.tsx`
- Renders the active orders cards fetched from the DB.
- Integrates client-side state to handle inline updates:
  - Clicking `Prepare` triggers `PATCH /api/orders/status` changing status to `preparing`.
  - Clicking `Mark Ready` changes status to `ready`.
  - Clicking `Complete` changes status to `collected` (for takeaway) or `delivered` (for delivery), removing the card from the active list.
- Calculates and displays elapsed time timers on each card dynamically using a `useEffect` interval loop.

---

### Bookings & Arrivals Page — `app/(dashboard)/dashboard/bookings/page.tsx`
- Fetches all of today's confirmed room reservations.
- Displays guest name, room (Husk / Haven), duration, party size, and scheduled slot.
- Lists pre-ordered food items directly inside the card (e.g. `3x Pastry, 1x Croffle`).
- Provides a check-in toggle button that markers whether the guest has arrived.

---

### Room Status Page — `app/(dashboard)/dashboard/status/page.tsx`
- Displays the layout mapping room names to current conditions:
  - **Occupied**: If today's date and the current time fall within a confirmed reservation's window.
  - **Available**: If no active booking overlap exists.
  - **Needs Cleaning**: A toggleable state indicating whether a room requires cleanup after a booking slot ends.

---

## Dependencies

No extra npm packages are required. Audio alerts use the native HTML5 browser `Audio` constructor.

---

## Verification Checklist

### Role-Based Access
- [ ] Non-staff users (e.g. customers or unauthenticated guests) attempting to visit `/dashboard` are blocked by middleware.
- [ ] Active staff profiles load layout elements with the correct shift and name indicators.

### Orders Queue
- [ ] Fetches and renders all active orders (`placed`, `preparing`, `ready`, `dispatched`).
- [ ] Completed orders (`collected`, `delivered`) are automatically excluded from the queue.
- [ ] Active card timer updates elapsed duration inline every minute.
- [ ] Status action button triggers PATCH call and transitions order state correctly.
- [ ] Transitioning an order to a final status (`collected`/`delivered`) removes the card from the view.

### Arrivals Board
- [ ] Displays today's reservations sorted chronologically.
- [ ] Lists guest count, room type, time slots, and pre-ordered food items.

### Room Statuses
- [ ] Room list shows HUSK and HAVEN status dynamically.
- [ ] Check-in actions flag guests as checked-in.

### Real-time Alerts
- [ ] Simulating a new booking insert (`status = 'confirmed'`) triggers the floating toast overlay.
- [ ] Alert plays the chime audio (`notification.mp3`) successfully in the browser.
- [ ] Simulating a new food order insert (`status = 'placed'`) triggers notifications in all connected dashboard windows.
