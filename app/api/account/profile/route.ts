import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters').nullable(),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number').or(z.literal('')).nullable(),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    
    // 1. Authenticate user session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // 2. Parse and validate input
    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { name, phone } = parsed.data;

    // 3. Update public.users table (allowed by RLS 'users: update own row')
    const { data, error: updateError } = await supabase
      .from('users')
      .update({
        name,
        phone: phone || null,
      })
      .eq('id', session.user.id)
      .select('name, phone')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
