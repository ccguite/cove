import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createSupabaseStaffServerClient();

    // 1. Authenticate user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // 2. Fetch role from public.users table (do not trust JWT claims)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const { role } = user;
    const ALLOWED_ROLES = ['admin', 'kitchen', 'reception'];
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    // 3. Parse and validate input payload
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing orderId or status parameter' }, { status: 400 });
    }

    const ALLOWED_STATUSES = ['placed', 'preparing', 'ready', 'dispatched', 'collected'];
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status transition: ${status}` }, { status: 400 });
    }

    // 4. Update the order status in the database
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: `Failed to update order status: ${updateError.message}` }, { status: 500 });
    }

    // 5. Return consistent response shape: { data }
    return NextResponse.json({ data: updatedOrder });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
