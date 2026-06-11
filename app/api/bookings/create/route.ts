import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { createRazorpayOrder } from '@/lib/razorpay/orderCreator';
import { validateBookingBoundaries, validateGuestCount, checkSlotConflict } from '@/lib/booking/slotValidator';
import type { Room, MenuItem } from '@/lib/supabase/types';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Authenticate session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const body = await req.json();
    const { roomId, date, startTime, durationHours, guestCount, foodItems } = body;

    // Boundary check
    if (!validateBookingBoundaries(startTime, durationHours)) {
      return NextResponse.json({ error: 'Boundary violations (duration out of range or past 11PM)' }, { status: 400 });
    }

    // Get room details
    const { data: room } = await supabase.from('rooms').select('*').eq('id', roomId).single();
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const typedRoom = room as Room;

    // Capacity validation
    if (!validateGuestCount(typedRoom.slug, guestCount)) {
      return NextResponse.json({ error: 'Guest count violates room limits' }, { status: 400 });
    }

    // Double-booking check
    const isConflict = await checkSlotConflict(supabase, roomId, date, startTime, durationHours);
    if (isConflict) {
      return NextResponse.json({ error: 'Room slot is already booked' }, { status: 409 });
    }

    // Calculate Price Server-Side
    const roomRentTotal = typedRoom.price_per_hour * durationHours;
    let foodTotal = 0;
    const validatedFoodItems: Array<{ id: string; qty: number; price: number }> = [];

    if (foodItems && foodItems.length > 0) {
      const ids = foodItems.map((f: any) => f.id);
      const { data: dbFoodItems } = await supabase.from('menu_items').select('*').in('id', ids);

      if (dbFoodItems) {
        foodItems.forEach((f: any) => {
          const matchedDb = dbFoodItems.find((m: any) => m.id === f.id) as MenuItem;
          if (matchedDb && matchedDb.is_available) {
            foodTotal += matchedDb.price * f.qty;
            validatedFoodItems.push({ id: matchedDb.id, qty: f.qty, price: matchedDb.price });
          }
        });
      }
    }

    const subtotal = roomRentTotal + foodTotal;
    const convenienceFees = Math.round(subtotal * 0.05); // 5% flat convenience charge
    const grandTotal = subtotal + convenienceFees;

    // Database Transaction: Seed Booking and Food Items
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        user_id: session.user.id,
        room_id: roomId,
        date,
        start_time: startTime,
        duration_hours: durationHours,
        guest_count: guestCount,
        total_price: grandTotal,
        status: 'pending_payment'
      })
      .select()
      .single();

    if (bookingErr || !booking) {
      throw new Error(`Failed to create pending booking: ${bookingErr?.message}`);
    }

    // Snapshot pre-ordered food items immediately
    if (validatedFoodItems.length > 0) {
      const foodItemRows = validatedFoodItems.map(item => ({
        booking_id: booking.id,
        menu_item_id: item.id,
        quantity: item.qty,
        unit_price: item.price
      }));

      const { error: foodErr } = await supabase.from('booking_food_items').insert(foodItemRows);
      if (foodErr) {
        throw new Error(`Failed to save pre-order items: ${foodErr.message}`);
      }
    }

    // Create Razorpay checkout order
    const rpOrder = await createRazorpayOrder(grandTotal, booking.id);

    // Save Razorpay order ID to the pending booking
    const { error: updateErr } = await supabase
      .from('bookings')
      .update({ razorpay_order_id: rpOrder.id })
      .eq('id', booking.id);

    if (updateErr) {
      throw new Error(`Failed to update booking transaction parameters: ${updateErr.message}`);
    }

    return NextResponse.json({
      data: {
        bookingId: booking.id,
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
