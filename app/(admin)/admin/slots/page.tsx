import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import SlotsClient from '../../../(dashboard)/dashboard/slots/SlotsClient';

export const metadata = { title: 'Slot Blocking — COVE Admin' };

export default async function AdminSlotsPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');
  const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/staff/login?error=unauthorized');

  const { data: rooms } = await supabase.from('rooms').select('*').order('name');
  const today = new Date().toISOString().split('T')[0];
  const { data: activeBlocks } = await supabase
    .from('blocked_slots')
    .select('*');
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', today)
    .eq('status', 'confirmed');

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Slot Blocking</h2>
        <p className="dashboard-page-subtitle">Manually block time slots from customer booking. Useful for maintenance, private events, or peak hour management.</p>
      </div>
      <SlotsClient rooms={rooms || []} initialBookings={bookings || []} initialBlocks={activeBlocks || []} />
    </div>
  );
}
