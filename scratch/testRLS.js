const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let env = {};
try {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      env[key] = val;
    }
  });
} catch (e) {
  console.log('Error reading .env.local:', e.message);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Error: URL or Anon Key is missing');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function run() {
  const email = 'testcustomer_2oeur@cove.com';
  const password = 'Password123!';

  // Authenticate the client as this user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error('Error signing in:', signInError.message);
    process.exit(1);
  }

  const user = signInData.user;
  console.log('Signed in successfully as:', user.email);

  // Get a room to test booking
  const { data: rooms, error: roomsErr } = await supabase.from('rooms').select('*').limit(1);
  if (roomsErr || !rooms || rooms.length === 0) {
    console.error('Error getting room:', roomsErr);
    process.exit(1);
  }
  const room = rooms[0];
  console.log('Using room:', room.name, 'ID:', room.id);

  // Get a menu item to test preorders
  const { data: menuItems, error: menuErr } = await supabase.from('menu_items').select('*').eq('is_available', true).limit(1);
  if (menuErr || !menuItems || menuItems.length === 0) {
    console.error('Error getting menu item:', menuErr);
    process.exit(1);
  }
  const menuItem = menuItems[0];
  console.log('Using menu item:', menuItem.name, 'ID:', menuItem.id);

  const date = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // tomorrow
  const startTime = '14:00:00';
  const durationHours = 2;

  // 1. Test slot lock INSERT
  console.log('1. Testing slot lock INSERT...');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const { data: lock, error: lockErr } = await supabase
    .from('slot_locks')
    .insert({
      room_id: room.id,
      date,
      start_time: startTime,
      duration_hours: durationHours,
      expires_at: expiresAt
    })
    .select()
    .single();

  if (lockErr) {
    console.error('❌ Slot lock INSERT failed:', lockErr.message);
  } else {
    console.log('✅ Slot lock INSERT succeeded! ID:', lock.id);
  }

  // 2. Test booking INSERT
  console.log('2. Testing booking INSERT...');
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      room_id: room.id,
      date,
      start_time: startTime,
      duration_hours: durationHours,
      guest_count: room.min_pax,
      total_price: room.price_per_hour * durationHours,
      status: 'pending_payment'
    })
    .select()
    .single();

  if (bookingErr) {
    console.error('❌ Booking INSERT failed:', bookingErr.message);
  } else {
    console.log('✅ Booking INSERT succeeded! ID:', booking.id);
  }

  // 3. Test booking food item INSERT
  if (booking) {
    console.log('3. Testing booking food item INSERT...');
    const { data: bookingFood, error: bookingFoodErr } = await supabase
      .from('booking_food_items')
      .insert({
        booking_id: booking.id,
        menu_item_id: menuItem.id,
        quantity: 1,
        unit_price: menuItem.price
      })
      .select();

    if (bookingFoodErr) {
      console.error('❌ Booking food item INSERT failed:', bookingFoodErr.message);
    } else {
      console.log('✅ Booking food item INSERT succeeded!');
    }
  }

  // 4. Test order INSERT
  console.log('4. Testing order INSERT...');
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      type: 'takeaway',
      status: 'pending_payment',
      total_price: menuItem.price
    })
    .select()
    .single();

  if (orderErr) {
    console.error('❌ Order INSERT failed:', orderErr.message);
  } else {
    console.log('✅ Order INSERT succeeded! ID:', order.id);
  }

  // 5. Test order item INSERT
  if (order) {
    console.log('5. Testing order item INSERT...');
    const { data: orderItem, error: orderItemErr } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        menu_item_id: menuItem.id,
        quantity: 1,
        unit_price: menuItem.price
      })
      .select();

    if (orderItemErr) {
      console.error('❌ Order item INSERT failed:', orderItemErr.message);
    } else {
      console.log('✅ Order item INSERT succeeded!');
    }
  }

  // 6. Test slot lock DELETE
  if (lock) {
    console.log('6. Testing slot lock DELETE...');
    const { error: lockDelErr } = await supabase
      .from('slot_locks')
      .delete()
      .eq('id', lock.id);

    if (lockDelErr) {
      console.error('❌ Slot lock DELETE failed:', lockDelErr.message);
    } else {
      console.log('✅ Slot lock DELETE succeeded!');
    }
  }

  // 7. Test webhook RPC confirm payment (anonymous bypass check)
  console.log('7. Testing webhook RPC confirm payment...');
  // We first update the booking/order to have a dummy razorpay_order_id so we can look it up
  const mockRpOrderId = `order_test_${Math.random().toString(36).substring(7)}`;
  
  if (booking) {
    await supabase.from('bookings').update({ razorpay_order_id: mockRpOrderId }).eq('id', booking.id);
    
    // Now trigger RPC confirm
    console.log(`Calling RPC confirm_payment_via_webhook with Razorpay Order ID: ${mockRpOrderId}`);
    const { data: rpcResult, error: rpcErr } = await supabase.rpc('confirm_payment_via_webhook', {
      p_razorpay_order_id: mockRpOrderId,
      p_secret: 'cove_secure_webhook_secret_2026'
    });

    if (rpcErr) {
      console.error('❌ RPC call failed:', rpcErr.message);
    } else {
      console.log('✅ RPC call succeeded! Result:', rpcResult);
      
      // Verify the booking is now confirmed
      const { data: checkBooking } = await supabase.from('bookings').select('status').eq('id', booking.id).single();
      console.log('Confirmed Booking status is:', checkBooking?.status);
    }
  }

  // Clean up test data
  console.log('Cleaning up test data...');
  if (booking) {
    await supabase.from('bookings').delete().eq('id', booking.id);
  }
  if (order) {
    await supabase.from('orders').delete().eq('id', order.id);
  }
  
  // Clean up user
  // We can't delete users via anon client easily due to RLS, but that's fine.
  console.log('Verification finished.');
}

run();
