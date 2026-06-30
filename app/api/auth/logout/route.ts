import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { createSupabaseServerClient, createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';

export async function POST() {
  const headersList = await headers();
  const referer = headersList.get('referer') || '';
  const isStaff = referer.includes('/admin') || referer.includes('/reception') || referer.includes('/kitchen') || referer.includes('/staff');

  try {
    const supabase = isStaff ? createSupabaseStaffServerClient() : createSupabaseServerClient();
    
    // Check if session exists first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signOut returned error:', error);
      }
    }
  } catch (err: unknown) {
    console.error('Supabase auth check/signOut failed:', err);
  }

  // Explicitly delete supabase-related cookies for this role context
  try {
    const cookieStore = await cookies();
    const targetPrefix = isStaff ? 'sb-staff-auth-token' : 'sb-customer-auth-token';
    
    cookieStore.getAll().forEach(cookie => {
      if (cookie.name.startsWith(targetPrefix)) {
        try {
          cookieStore.delete(cookie.name);
        } catch {}
      }
    });
  } catch (e) {
    console.error('Failed to clear cookies:', e);
  }

  return NextResponse.json({ success: true });
}
