import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import { getRoomsList, getTodaysBookings, getTodaysBlockedSlots } from '@/lib/orders/orderService';
import RoomStatusClient from '../../../(dashboard)/dashboard/status/RoomStatusClient';

export const metadata = { title: 'Room Status — COVE Reception', description: 'Monitor room occupancy.' };

export default async function ReceptionStatusPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');
  const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'reception')) {
    redirect('/staff/login?error=unauthorized');
  }

  let rooms: any[] = [], initialBookings: any[] = [], initialBlocks: any[] = [];
  try {
    [rooms, initialBookings, initialBlocks] = await Promise.all([getRoomsList(), getTodaysBookings(), getTodaysBlockedSlots()]);
  } catch {}

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Room Status Board</h2>
        <p className="dashboard-page-subtitle">Monitor current room occupancy and cleanup states.</p>
      </div>
      <RoomStatusClient rooms={rooms} initialBookings={initialBookings} initialBlocks={initialBlocks} />
    </div>
  );
}
