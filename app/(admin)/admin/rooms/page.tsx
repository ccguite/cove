import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import { getRoomsList, getTodaysBookings, getTodaysBlockedSlots } from '@/lib/orders/orderService';
import RoomsClient from './RoomsClient';

export const metadata = {
  title: 'Rooms — COVE Admin',
  description: 'Manage room details, photos, pricing, and monitor live occupancy.',
};

export default async function AdminRoomsPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', session.user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/staff/login?error=unauthorized');

  let rooms: any[] = [];
  let initialBookings: any[] = [];
  let initialBlocks: any[] = [];

  try {
    [rooms, initialBookings, initialBlocks] = await Promise.all([
      getRoomsList(),
      getTodaysBookings(),
      getTodaysBlockedSlots(),
    ]);
  } catch {}

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Rooms</h2>
        <p className="dashboard-page-subtitle">
          Monitor live occupancy and manage room details, pricing, and photos.
        </p>
      </div>
      <RoomsClient rooms={rooms} initialBookings={initialBookings} initialBlocks={initialBlocks} />
    </div>
  );
}
