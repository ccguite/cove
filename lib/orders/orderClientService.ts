import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

export async function getActiveOrdersClient() {
  const supabase = createSupabaseBrowserClient();
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

export async function getTodaysBookingsClient() {
  const supabase = createSupabaseBrowserClient();
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

export async function getTodaysBlockedSlotsClient() {
  const supabase = createSupabaseBrowserClient();
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
