import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseStaffServerClient, createSupabaseServiceClient } from '@/lib/supabase/serverClient';
import { checkSlotConflict } from '@/lib/booking/slotValidator';
import { z } from 'zod';

const createOfflineBookingSchema = z.object({
  guestName: z.string().min(1, 'Guest name is required'),
  guestPhone: z.string().regex(/^\d{10}$/, 'Guest phone must be exactly 10 digits'),
  roomId: z.string().uuid('Invalid room ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid start time format'),
  duration: z.number().int().min(1).max(5),
  guestCount: z.number().int().min(1),
  foodItems: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().int().min(1)
  })).optional()
});

export async function POST(req: NextRequest) {
  // 1. Authenticate staff member
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  // Verify role is staff/admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'reception')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Validate input body
  try {
    const body = await req.json();
    const result = createOfflineBookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
    }

    const { guestName, guestPhone, roomId, date, startTime, duration, guestCount, foodItems = [] } = result.data;

    // 3. Get room capacity details
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomErr || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (guestCount < room.min_pax || guestCount > room.max_pax) {
      return NextResponse.json({
        error: `Guest count must be between ${room.min_pax} and ${room.max_pax} for room ${room.name}`
      }, { status: 400 });
    }

    // 4. Validate time range boundaries (11PM closing, etc.)
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration * 60;
    
    if (startMinutes < 10 * 60 || endMinutes > 23 * 60) {
      return NextResponse.json({ error: 'Booking must be between 10:00 AM and 11:00 PM.' }, { status: 400 });
    }

    // 5. Conflict check
    const hasConflict = await checkSlotConflict(supabase, roomId, date, startTime, duration);
    if (hasConflict) {
      return NextResponse.json({ error: 'Selected time slot is already booked or blocked.' }, { status: 409 });
    }

    // 6. Look up or create customer user
    const serviceClient = createSupabaseServiceClient();
    
    // Check if user exists by phone
    const { data: customerUser } = await serviceClient
      .from('users')
      .select('id')
      .eq('phone', guestPhone)
      .maybeSingle();

    let userId = customerUser?.id;

    if (!userId) {
      // Create guest customer auth user
      const guestEmail = `guest_${guestPhone}@cove.com`;
      const { data: authUser, error: authErr } = await serviceClient.auth.admin.createUser({
        email: guestEmail,
        phone: guestPhone,
        password: Math.random().toString(36).slice(-12) + 'A1!',
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { name: guestName }
      });

      if (authErr || !authUser.user) {
        return NextResponse.json({ error: `Failed to create guest customer: ${authErr?.message}` }, { status: 500 });
      }

      userId = authUser.user.id;

      // Update name and phone in public.users profile
      await serviceClient
        .from('users')
        .update({ name: guestName, phone: guestPhone, role: 'customer' })
        .eq('id', userId);
    }

    // 7. Compute pricing (room price + food items)
    let foodTotal = 0;
    const validatedFoodItems: any[] = [];
    
    if (foodItems.length > 0) {
      const { data: dbFood } = await supabase
        .from('menu_items')
        .select('*')
        .in('id', foodItems.map(i => i.id));

      if (dbFood) {
        foodItems.forEach(item => {
          const dbItem = dbFood.find(d => d.id === item.id);
          if (dbItem && dbItem.is_available) {
            foodTotal += dbItem.price * item.quantity;
            validatedFoodItems.push({
              menu_item_id: dbItem.id,
              quantity: item.quantity,
              unit_price: dbItem.price
            });
          }
        });
      }
    }

    const roomTotal = room.price_per_hour * duration;
    const grandTotal = roomTotal + foodTotal;

    // 8. Insert booking
    const { data: booking, error: bookingErr } = await serviceClient
      .from('bookings')
      .insert({
        user_id: userId,
        room_id: roomId,
        date,
        start_time: startTime.includes(':') && startTime.split(':').length === 2 ? `${startTime}:00` : startTime,
        duration_hours: duration,
        guest_count: guestCount,
        total_price: grandTotal,
        status: 'confirmed',
        razorpay_order_id: `OFFLINE_${Date.now()}`
      })
      .select()
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: `Failed to create booking: ${bookingErr?.message}` }, { status: 500 });
    }

    // 9. Insert booking food items
    if (validatedFoodItems.length > 0) {
      const foodItemsToInsert = validatedFoodItems.map(item => ({
        booking_id: booking.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const { error: foodInsertErr } = await serviceClient
        .from('booking_food_items')
        .insert(foodItemsToInsert);

      if (foodInsertErr) {
        console.error('Failed to insert booking food items:', foodInsertErr);
      }
    }

    return NextResponse.json({ data: booking });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
