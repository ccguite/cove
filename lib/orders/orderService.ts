import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

export async function getActiveOrders() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
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

  if (error) {
    throw new Error(`Failed to fetch active orders: ${error.message}`);
  }

  return data || [];
}

export async function getTodaysBookings() {
  const supabase = createSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      rooms (name, slug),
      users (name, phone),
      booking_food_items (
        quantity,
        unit_price,
        menu_items (name)
      )
    `)
    .eq('date', today)
    .eq('status', 'confirmed')
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch today's bookings: ${error.message}`);
  }

  return data || [];
}

export async function getTodaysBlockedSlots() {
  const supabase = createSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('blocked_slots')
    .select('*')
    .eq('date', today);

  if (error) {
    throw new Error(`Failed to fetch today's blocked slots: ${error.message}`);
  }

  return data || [];
}

export async function getRoomsList() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch rooms: ${error.message}`);
  }

  return data || [];
}
