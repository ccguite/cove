import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';

async function handleUnblock(req: NextRequest) {
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
    const { blockId } = body;

    if (!blockId) {
      return NextResponse.json({ error: 'Missing required parameter: blockId' }, { status: 400 });
    }

    // 4. Delete the blocked slot row
    const { error: deleteErr } = await supabase
      .from('blocked_slots')
      .delete()
      .eq('id', blockId);

    if (deleteErr) {
      return NextResponse.json({ error: `Failed to remove slot block: ${deleteErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ data: { success: true } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleUnblock(req);
}

export async function DELETE(req: NextRequest) {
  return handleUnblock(req);
}
