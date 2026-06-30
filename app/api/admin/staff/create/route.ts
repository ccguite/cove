import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseStaffServerClient, createSupabaseServiceClient } from '@/lib/supabase/serverClient';

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
    const { email, password, name, role } = body;

    // Validate parameters
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required parameters: email, password, name, or role' }, { status: 400 });
    }

    if (role !== 'reception' && role !== 'kitchen' && role !== 'admin') {
      return NextResponse.json({ error: 'Invalid role. Must be admin, reception, or kitchen' }, { status: 400 });
    }

    // 4. Create user in auth via Service-Role Client
    const serviceSupabase = createSupabaseServiceClient();
    const { data: authData, error: authErr } = await serviceSupabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { name: name.trim() }
    });

    if (authErr || !authData.user) {
      return NextResponse.json({ error: `Auth account creation failed: ${authErr?.message || 'Unknown error'}` }, { status: 500 });
    }

    // 5. Upsert matching profile in users table (override default trigger value)
    const { error: upsertErr } = await serviceSupabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: role
      });

    if (upsertErr) {
      console.error('Failed to upsert user profile:', upsertErr);
      // Clean up the created auth user so we don't end up in an inconsistent state
      await serviceSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: `Failed to initialize user profile: ${upsertErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ data: { id: authData.user.id, email, name, role } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
