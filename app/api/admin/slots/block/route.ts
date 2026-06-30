import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import { validateBookingBoundaries } from '@/lib/booking/slotValidator';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseStaffServerClient();

    // 1. Authenticate user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // 2. Fetch user profile and verify admin role
    const { data: userProfile, error: profileErr } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileErr || !userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Parse input body
    const body = await req.json();
    const { roomId, date, startTime, durationHours, reason } = body;

    // Validate parameters
    if (!roomId || !date || !startTime || !durationHours) {
      return NextResponse.json({ error: 'Missing required parameters: roomId, date, startTime, or durationHours' }, { status: 400 });
    }

    const duration = parseInt(String(durationHours), 10);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json({ error: 'durationHours must be a positive number' }, { status: 400 });
    }

    // Enforce operating boundaries (cannot extend past 11:00 PM, must be 1 - 5 hours)
    if (!validateBookingBoundaries(startTime, duration)) {
      return NextResponse.json({ error: 'Invalid time slot or duration. Operating hours are 10:00 AM - 11:00 PM.' }, { status: 400 });
    }

    // 4. Insert row into blocked_slots
    const { data: block, error: blockErr } = await supabase
      .from('blocked_slots')
      .insert({
        room_id: roomId,
        date,
        start_time: startTime,
        duration_hours: duration,
        reason: reason ? String(reason).trim() : null,
        created_by: session.user.id,
      })
      .select()
      .single();

    if (blockErr) {
      return NextResponse.json({ error: `Failed to create slot block: ${blockErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ data: block });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
