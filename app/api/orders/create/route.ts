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

      const neighborhoodName = NEIGHBORHOODS[deliveryAddress.neighborhoodId]?.name || deliveryAddress.neighborhoodId;
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
    let hasRoomOnlyItem = false;

    items.forEach((item: any) => {
      const matchedDb = dbItems.find((d: any) => d.id === item.id) as any;
      if (matchedDb && matchedDb.is_available) {
        if (matchedDb.only_for_rooms) {
          hasRoomOnlyItem = true;
        }
        subtotal += matchedDb.price * item.qty;
        validatedItems.push({ id: matchedDb.id, qty: item.qty, price: matchedDb.price });
      }
    });

    if (hasRoomOnlyItem) {
      return NextResponse.json({ error: 'Combo packages can only be ordered alongside room bookings' }, { status: 400 });
    }

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
