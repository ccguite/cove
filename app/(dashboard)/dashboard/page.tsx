import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';

export default async function LegacyDashboardRedirect() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');

  const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  const role = profile?.role;

  if (role === 'admin') redirect('/admin');
  if (role === 'reception') redirect('/reception');
  if (role === 'kitchen') redirect('/kitchen');

  redirect('/staff/login?error=unauthorized');
}
