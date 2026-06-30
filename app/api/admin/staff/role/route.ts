import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseStaffServerClient, createSupabaseServiceClient } from '@/lib/supabase/serverClient';

export async function PATCH(req: NextRequest) {
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

    // 3. Parse and validate input payload
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing required parameters: userId or role' }, { status: 400 });
    }

    if (role !== 'reception' && role !== 'kitchen' && role !== 'admin' && role !== 'customer') {
      return NextResponse.json({ error: 'Invalid role. Must be admin, reception, kitchen, or customer' }, { status: 400 });
    }

    // Prevent self-demotion to avoid locking out the current administrator
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot modify your own administrative role' }, { status: 400 });
    }

    // 4. Update the role in the users table using service role client
    const serviceSupabase = createSupabaseServiceClient();
    const { error: updateErr } = await serviceSupabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (updateErr) {
      return NextResponse.json({ error: `Failed to update user role: ${updateErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ data: { userId, role, success: true } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
