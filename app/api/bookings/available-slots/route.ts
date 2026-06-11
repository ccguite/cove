import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const date = searchParams.get('date');

    if (!roomId || !date) {
      return NextResponse.json({ error: 'Missing roomId or date parameter' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // 1. Housekeeping: Remove expired slot locks
    await supabase
      .from('slot_locks')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // 2. Fetch confirmed bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, duration_hours')
      .eq('room_id', roomId)
      .eq('date', date)
      .eq('status', 'confirmed');

    // 3. Fetch active slot locks
    const { data: locks } = await supabase
      .from('slot_locks')
      .select('start_time, duration_hours')
      .eq('room_id', roomId)
      .eq('date', date);

    // 4. Fetch manual admin blocks
    const { data: blocks } = await supabase
      .from('blocked_slots')
      .select('start_time, duration_hours')
      .eq('room_id', roomId)
      .eq('date', date);

    // Operating hours range: 10:00 AM to 10:00 PM starting slot
    const allSlots = [
      '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
      '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    const unavailableSlots = new Set<string>();

    const checkOverlap = (start: string, duration: number) => {
      const startHour = parseInt(start.split(':')[0], 10);
      for (let i = 0; i < duration; i++) {
        unavailableSlots.add(`${startHour + i}:00`.padStart(5, '0'));
      }
    };

    bookings?.forEach(b => checkOverlap(b.start_time, b.duration_hours));
    locks?.forEach(l => checkOverlap(l.start_time, l.duration_hours));
    blocks?.forEach(bl => checkOverlap(bl.start_time, bl.duration_hours));

    const availableSlots = allSlots.filter(slot => !unavailableSlots.has(slot));

    return NextResponse.json({ data: { availableSlots } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
