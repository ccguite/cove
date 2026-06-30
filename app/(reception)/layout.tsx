import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import StaffSidebarLogout from '../(admin)/StaffSidebarLogout';
import '../(dashboard)/dashboard.css';

const NAV_ITEMS = [
  { label: 'Overview',    icon: 'dashboard',    path: '/reception' },
  { label: 'Orders',      icon: 'receipt_long', path: '/reception/orders' },
  { label: 'Bookings',    icon: 'book_online',  path: '/reception/bookings' },
  { label: 'Room Status', icon: 'meeting_room', path: '/reception/status' },
];

export default async function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');

  const { data: profile } = await supabase
    .from('users').select('role, name').eq('id', session.user.id).single();

  if (!profile || !['admin', 'reception'].includes(profile.role)) {
    redirect('/staff/login?error=unauthorized');
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div>
            <h1 className="sidebar-brand">COVE</h1>
            <p className="sidebar-subtitle">Reception</p>
          </div>
          <StaffSidebarLogout />
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} href={item.path} className="sidebar-link">
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="mobile-top-bar">
        <Link href="/reception" className="mobile-brand">COVE</Link>
        <div className="mobile-top-bar-right">
          <span className="user-role mobile-user-role-badge">Reception</span>
          <StaffSidebarLogout />
        </div>
      </div>

      <main className="dashboard-main">{children}</main>

      <nav className="mobile-bottom-bar">
        {NAV_ITEMS.map((item) => (
          <Link key={item.path} href={item.path} className="mobile-bottom-link">
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="mobile-bottom-link-text">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
