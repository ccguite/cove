import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import StaffSidebarLogout from '../(admin)/StaffSidebarLogout';
import '../(dashboard)/dashboard.css';

const NAV_ITEMS = [
  { label: 'Orders Queue', icon: 'receipt_long', path: '/kitchen' },
];

export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');

  const { data: profile } = await supabase
    .from('users').select('role, name').eq('id', session.user.id).single();

  if (!profile || !['admin', 'kitchen'].includes(profile.role)) {
    redirect('/staff/login?error=unauthorized');
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div>
            <h1 className="sidebar-brand">COVE</h1>
            <p className="sidebar-subtitle">Kitchen</p>
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
        <Link href="/kitchen" className="mobile-brand">COVE</Link>
        <div className="mobile-top-bar-right">
          <span className="user-role mobile-user-role-badge">Kitchen</span>
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
