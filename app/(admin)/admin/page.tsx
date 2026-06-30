import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';

export const metadata = { title: 'Admin Overview — COVE', description: 'COVE Super Admin dashboard.' };

export default async function AdminOverviewPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');

  const { data: profile } = await supabase.from('users').select('name, role').eq('id', session.user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/staff/login?error=unauthorized');

  const today = new Date().toISOString().split('T')[0];
  const { count: activeOrdersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['placed', 'preparing', 'ready', 'dispatched']);
  const { count: todaysBookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'confirmed');

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Admin Overview</h2>
        <p className="dashboard-page-subtitle">Welcome back, {profile.name || 'Super Admin'}. Full system access.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
          <div className="profile-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', height: '100%' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>receipt_long</span>
            <span style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)' }}>{activeOrdersCount || 0}</span>
            <span style={{ fontSize: 'var(--text-size-label-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Active Orders</span>
          </div>
        </Link>
        <Link href="/admin/bookings" style={{ textDecoration: 'none' }}>
          <div className="profile-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', height: '100%' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>calendar_today</span>
            <span style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)' }}>{todaysBookingsCount || 0}</span>
            <span style={{ fontSize: 'var(--text-size-label-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{"Today's Bookings"}</span>
          </div>
        </Link>
        <Link href="/admin/status" style={{ textDecoration: 'none' }}>
          <div className="profile-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', height: '100%' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>meeting_room</span>
            <span style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)' }}>2</span>
            <span style={{ fontSize: 'var(--text-size-label-sm)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Lounges</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
