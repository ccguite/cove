import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createSupabaseStaffServerClient();

    // 1. Authenticate user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // 2. Fetch user profile role from DB
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Parse and validate input payload
    const body = await req.json();
    const { id, isAvailable } = body;

    if (!id || typeof isAvailable !== 'boolean') {
      return NextResponse.json({ error: 'Missing or invalid id/isAvailable parameters' }, { status: 400 });
    }

    // 4. Update availability in database
    const { data: updatedItem, error: updateError } = await supabase
      .from('menu_items')
      .update({ is_available: isAvailable })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: `Failed to update availability: ${updateError.message}` }, { status: 500 });
    }

    // 5. Purge static page cache for public menu path
    revalidatePath('/menu');

    return NextResponse.json({ data: updatedItem });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
