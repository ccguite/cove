import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { checkSlotConflict } from '@/lib/booking/slotValidator';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const body = await req.json();
    const { roomId, date, startTime, durationHours } = body;

    if (!roomId || !date || !startTime || !durationHours) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Clean up expired locks first
    await supabase
      .from('slot_locks')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Validate slot availability
    const conflict = await checkSlotConflict(supabase, roomId, date, startTime, durationHours);
    if (conflict) {
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes TTL

    const { data: lock, error: lockErr } = await supabase
      .from('slot_locks')
      .insert({
        room_id: roomId,
        date,
        start_time: startTime,
        duration_hours: durationHours,
        expires_at: expiresAt,
        locked_by: session.user.id
      })
      .select()
      .single();

    if (lockErr || !lock) {
      return NextResponse.json({ error: 'Failed to acquire reservation lock' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        lockId: lock.id,
        expiresAt: lock.expires_at
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
