import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import { getTodaysBookings } from '@/lib/orders/orderService';
import BookingsArrivalsClient from '../../../(dashboard)/dashboard/bookings/BookingsArrivalsClient';

export const metadata = { title: "Today's Bookings — COVE Admin", description: 'Manage arrivals and check-ins.' };

export default async function AdminBookingsPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');
  const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/staff/login?error=unauthorized');

  let initialBookings: any[] = [];
  try { initialBookings = await getTodaysBookings(); } catch {}

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Daily Arrivals</h2>
        <p className="dashboard-page-subtitle">Track and check-in guests arriving for room reservations today.</p>
      </div>
      <BookingsArrivalsClient initialBookings={initialBookings} />
    </div>
  );
}
