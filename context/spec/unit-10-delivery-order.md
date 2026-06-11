# Spec: Unit 10 — Delivery Radius Logic + Food Order Flow (UI + API + Payment)

## Goal

Implement the standalone food ordering flow under `app/(customer)/order/` supporting takeaway and delivery order types. Build delivery address validation using the Haversine distance formula against a central COVE location for popular Aizawl neighborhoods. Restrict delivery orders to a 5km radius and enforce a ₹299 minimum order limit before creating a pending order row, generating a Razorpay checkout order, and confirming payment through the updated webhook.

---

## Design

### Client-Side Order Stepper Wizard
The food ordering interface at `/order` guides the customer through a step-by-step cart configuration using the **Seoul Serenity** theme canvas (`--color-background`).

The steps are:
1. **Step 1: Order Type Selector**:
   - A toggle component to choose between **Takeaway** (self-pickup) and **Delivery** (COVE riders).
   - Display a brief explanation of the rules: Delivery requires a minimum order of ₹299 and must be within a 5km radius of COVE.
2. **Step 2: Menu Browser & Cart**:
   - **Menu Grid**: Integrates the product layout from `menu_cove/code.html`. Displays item categories, titles, descriptions, prices, and "Add to Order" buttons. Sold-out items show the dark "Sold Out" banner and disable interaction.
   - **Cart Sidebar**: Renders item thumbnails, prices, and quantity selectors (`-` and `+` controls). Calculates subtotal, tax (e.g. 5%), and running totals in real time.
   - Enforces the ₹299 minimum checkout constraint for delivery orders: disables the progress button and displays a warning banner if the subtotal is too low.
3. **Step 3: Delivery Address Selection (If Delivery Selected)**:
   - **Neighborhood Selector**: A dropdown input listing prominent Aizawl neighborhoods. Selecting a neighborhood fetches its coordinate distance from `/api/orders/validate-address`.
   - **Address Details**: Textarea input for flat number, street name, and landmarks.
   - If the selected neighborhood falls outside the 5km radius, displays an error message using `--color-error` (e.g., "Address outside our 5km delivery radius") and blocks checkout progression.
4. **Step 4: Order Summary & Payment**:
   - Final breakdown panel: Lists all order items with quantities, delivery details or takeaway notes, and pricing calculations (Subtotal, 5% Delivery Fee if applicable, Taxes, and Grand Total).
   - "Confirm & Pay" CTA opens the Razorpay overlay to process the transaction.

### Radius Check & Central Coordinates
The central location of COVE Café in Aizawl is defined at:
- **Latitude**: `23.7307`
- **Longitude**: `92.7169`

To perform validation without active geocoding API dependencies, the system maintains a hardcoded dictionary mapping standard Aizawl neighborhoods to coordinates:

| Neighborhood ID | Name | Latitude | Longitude | Status (Within 5km) |
|---|---|---|---|---|
| `chanmari` | Chanmari | `23.7360` | `92.7176` | ✅ Yes (0.6 km) |
| `dawrpui` | Dawrpui | `23.7290` | `92.7170` | ✅ Yes (0.2 km) |
| `zarkawt` | Zarkawt | `23.7315` | `92.7172` | ✅ Yes (0.1 km) |
| `ramhlun` | Ramhlun | `23.7485` | `92.7240` | ✅ Yes (2.1 km) |
| `bawngkawn` | Bawngkawn | `23.7610` | `92.7275` | ✅ Yes (3.5 km) |
| `khatla` | Khatla | `23.7125` | `92.7145` | ✅ Yes (2.0 km) |
| `maubawk` | Maubawk | `23.7010` | `92.7050` | ✅ Yes (3.5 km) |
| `melthum` | Melthum | `23.6820` | `92.7010` | ❌ No (5.7 km) |
| `sihphir` | Sihphir | `23.8100` | `92.7400` | ❌ No (9.1 km) |

---

## Implementation

### Folder Layout
Create the files in the following boundary positions:

```
cove/
├── app/
│   ├── (customer)/
│   │   └── order/
│   │       ├── page.tsx                    # Standalone food ordering wizard
│   │       ├── page.css                    # Wizard custom stylesheet
│   │       └── confirmation/
│   │           └── page.tsx                # Order success details page
│   └── api/
│       └── orders/
│           ├── validate-address/
│           │   └── route.ts                # Radius check validation endpoint
│           └── create/
│               └── route.ts                # Pending food order creation endpoint
└── lib/
    └── delivery/
        └── radiusCheck.ts                  # Haversine distance calculator
```

---

### Delivery Calculator — `lib/delivery/radiusCheck.ts`
Implement the mathematical Haversine distance formula to calculate distance between two coordinates.

```ts
/**
 * Hardcoded Aizawl neighborhood coordinates dictionary.
 */
export const NEIGHBORHOODS: Record<string, { name: string; lat: number; lng: number }> = {
  chanmari: { name: 'Chanmari', lat: 23.7360, lng: 92.7176 },
  dawrpui: { name: 'Dawrpui', lat: 23.7290, lng: 92.7170 },
  zarkawt: { name: 'Zarkawt', lat: 23.7315, lng: 92.7172 },
  ramhlun: { name: 'Ramhlun', lat: 23.7485, lng: 92.7240 },
  bawngkawn: { name: 'Bawngkawn', lat: 23.7610, lng: 92.7275 },
  khatla: { name: 'Khatla', lat: 23.7125, lng: 92.7145 },
  maubawk: { name: 'Maubawk', lat: 23.7010, lng: 92.7050 },
  melthum: { name: 'Melthum', lat: 23.6820, lng: 92.7010 },
  sihphir: { name: 'Sihphir', lat: 23.8100, lng: 92.7400 },
};

// COVE location in Aizawl
export const COVE_COORDINATES = { lat: 23.7307, lng: 92.7169 };
export const MAX_DELIVERY_RADIUS_KM = 5.0;

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculates distance between two coordinates in kilometers using the Haversine formula.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Validates if a neighborhood falls within the delivery boundary.
 */
export function isWithinDeliveryRadius(neighborhoodId: string): {
  isValid: boolean;
  distanceKm: number;
} {
  const target = NEIGHBORHOODS[neighborhoodId];
  if (!target) {
    return { isValid: false, distanceKm: Infinity };
  }

  const distance = calculateDistance(
    COVE_COORDINATES.lat,
    COVE_COORDINATES.lng,
    target.lat,
    target.lng
  );

  return {
    isValid: distance <= MAX_DELIVERY_RADIUS_KM,
    distanceKm: parseFloat(distance.toFixed(2))
  };
}
```

---

### Address Validation Route — `app/api/orders/validate-address/route.ts`
Enables client-side validation of selected neighborhood options.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { isWithinDeliveryRadius } from '@/lib/delivery/radiusCheck';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { neighborhoodId } = body;

    if (!neighborhoodId) {
      return NextResponse.json({ error: 'Missing neighborhoodId parameter' }, { status: 400 });
    }

    const { isValid, distanceKm } = isWithinDeliveryRadius(neighborhoodId);

    return NextResponse.json({
      data: {
        isValid,
        distanceKm
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
```

---

### Order Creation Route — `app/api/orders/create/route.ts`
Performs server-side validation of coordinates and pricing limits, inserts a pending record, and returns the Razorpay modal arguments.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { createRazorpayOrder } from '@/lib/razorpay/orderCreator';
import { isWithinDeliveryRadius, NEIGHBORHOODS } from '@/lib/delivery/radiusCheck';
import type { MenuItem } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // 1. Authenticate user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const body = await req.json();
    const { type, items, deliveryAddress } = body;

    if (!type || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing order details or items' }, { status: 400 });
    }

    // 2. Validate Order Type Rules
    let dbAddressString = '';
    if (type === 'delivery') {
      if (!deliveryAddress || !deliveryAddress.neighborhoodId || !deliveryAddress.streetAddress) {
        return NextResponse.json({ error: 'Delivery address parameters are incomplete' }, { status: 400 });
      }

      const { isValid, distanceKm } = isWithinDeliveryRadius(deliveryAddress.neighborhoodId);
      if (!isValid) {
        return NextResponse.json({ error: `Selected address falls outside our 5km delivery radius (${distanceKm}km)` }, { status: 400 });
      }

      const neighborhoodName = NEIGHBORHOODS[deliveryAddress.neighborhoodId].name;
      dbAddressString = `${deliveryAddress.streetAddress}, ${neighborhoodName}`;
    }

    // 3. Compute pricing from Database
    const itemIds = items.map((i: any) => i.id);
    const { data: dbItems } = await supabase.from('menu_items').select('*').in('id', itemIds);

    if (!dbItems || dbItems.length === 0) {
      return NextResponse.json({ error: 'Selected items not found in database' }, { status: 404 });
    }

    let subtotal = 0;
    const validatedItems: Array<{ id: string; qty: number; price: number }> = [];

    items.forEach((item: any) => {
      const matchedDb = dbItems.find((d: any) => d.id === item.id) as MenuItem;
      if (matchedDb && matchedDb.is_available) {
        subtotal += matchedDb.price * item.qty;
        validatedItems.push({ id: matchedDb.id, qty: item.qty, price: matchedDb.price });
      }
    });

    if (validatedItems.length === 0) {
      return NextResponse.json({ error: 'No available items selected' }, { status: 400 });
    }

    // Enforce ₹299 minimum for delivery
    if (type === 'delivery' && subtotal < 299) {
      return NextResponse.json({ error: 'Delivery orders require a minimum subtotal of ₹299' }, { status: 400 });
    }

    const deliveryFee = type === 'delivery' ? 50 : 0; // Flat delivery charge
    const tax = Math.round(subtotal * 0.05); // 5% flat GST
    const grandTotal = subtotal + deliveryFee + tax;

    // 4. Database Transaction: Insert Pending Order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: session.user.id,
        type,
        status: 'pending_payment',
        total_price: grandTotal,
        delivery_address: type === 'delivery' ? dbAddressString : null
      })
      .select()
      .single();

    if (orderErr || !order) {
      throw new Error(`Failed to initialize pending order: ${orderErr?.message}`);
    }

    // 5. Insert order item records
    const orderItemRows = validatedItems.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      quantity: item.qty,
      unit_price: item.price
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItemRows);
    if (itemsErr) {
      throw new Error(`Failed to save items list: ${itemsErr.message}`);
    }

    // 6. Generate Razorpay Checkout Payload
    const rpOrder = await createRazorpayOrder(grandTotal, order.id);

    // Save order ID to the pending transaction
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ razorpay_order_id: rpOrder.id })
      .eq('id', order.id);

    if (updateErr) {
      throw new Error(`Failed to append transaction details: ${updateErr.message}`);
    }

    return NextResponse.json({
      data: {
        orderId: order.id,
        razorpayOrderId: rpOrder.id,
        amount: rpOrder.amount,
        keyId: process.env.RAZORPAY_KEY_ID,
        customerName: session.user.user_metadata?.name || 'Customer',
        customerPhone: session.user.user_metadata?.phone || '',
        customerEmail: session.user.email || ''
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
```

---

### Extended Webhook — `app/api/razorpay/webhook/route.ts`
Extend the existing signature webhook handler to recognize food orders by inspecting both the bookings and orders tables.

```diff
  // Retrieve matching pending booking
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('razorpay_order_id', rpOrderId)
    .eq('status', 'pending_payment')
    .single();

  if (booking) {
    // Confirm reservation
    const { error: updateErr } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking.id);

    if (updateErr) {
      throw new Error(`Failed to confirm booking: ${updateErr.message}`);
    }

    // Release active slot locks
    await supabase
      .from('slot_locks')
      .delete()
      .eq('room_id', booking.room_id)
      .eq('date', booking.date)
      .eq('start_time', booking.start_time);
  } else {
+   // Handle standalone food order confirmation
+   const { data: foodOrder } = await supabase
+     .from('orders')
+     .select('*')
+     .eq('razorpay_order_id', rpOrderId)
+     .eq('status', 'pending_payment')
+     .single();
+
+   if (foodOrder) {
+     const { error: orderUpdateErr } = await supabase
+       .from('orders')
+       .update({ status: 'placed' })
+       .eq('id', foodOrder.id);
+
+     if (orderUpdateErr) {
+       throw new Error(`Failed to confirm food order: ${orderUpdateErr.message}`);
+     }
+   }
  }
```

---

## Dependencies

No extra packages needed. Integrates with existing `@supabase/ssr` database clients and the `razorpay` Node SDK.

---

## Verification Checklist

### Delivery Radius Logic Tests (`lib/delivery/radiusCheck.test.ts`)
- [ ] Run calculations using Vitest to assert correct outputs.
- [ ] Zarkawt, Dawrpui, and Chanmari coordinates evaluate to `isValid: true` (distances range under 1km).
- [ ] Bawngkawn coordinates evaluate to `isValid: true` (approx 3.5km distance).
- [ ] Melthum coordinates evaluate to `isValid: false` (approx 5.7km, which exceeds the limit).
- [ ] Sihphir coordinates evaluate to `isValid: false` (approx 9.1km).
- [ ] An unmapped neighborhood ID returns `isValid: false` and `distanceKm: Infinity`.

### Client Flow & Cart
- [ ] Unauthenticated clients visiting `/order` are redirected to `/login`.
- [ ] Cart selections show thumbnails, names, and prices correctly matching `menu_cove/code.html`.
- [ ] Quantity counter buttons update amounts and totals.
- [ ] Setting Delivery under the ₹299 threshold disables checkout and renders warning notices.
- [ ] Selecting Takeaway bypasses delivery validation inputs.
- [ ] Submitting a delivery address options updates validation status:
  - Outside radius: highlights error and blocks payment.
  - Inside radius: releases locks and enables payment.

### API & Webhooks
- [ ] POST `/api/orders/validate-address` returns correct radius values.
- [ ] POST `/api/orders/create` recalculates pricing server-side using DB references.
- [ ] Server blocks delivery order creation if subtotal is below ₹299 or radius check fails.
- [ ] Successful orders seed `orders` and `order_items` tables with snapshotted prices.
- [ ] Simulated webhook signature success triggers update of `orders.status` to `'placed'`.
- [ ] Safe signature utility rejects invalid header webhook triggers.
