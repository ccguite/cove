import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import StaffSidebarLogout from './StaffSidebarLogout';
import '../(dashboard)/dashboard.css';

const NAV_ITEMS = [
  { label: 'Overview',        icon: 'dashboard',       path: '/admin' },
  { label: 'Orders',          icon: 'receipt_long',    path: '/admin/orders' },
  { label: 'Bookings',        icon: 'book_online',     path: '/admin/bookings' },
  { label: 'Rooms',           icon: 'meeting_room',    path: '/admin/rooms' },
  { label: 'Menu Management', icon: 'restaurant_menu', path: '/admin/menu' },
  { label: 'Recipes',         icon: 'menu_book',       path: '/admin/recipes' },
  { label: 'Staff',           icon: 'badge',           path: '/admin/staff' },
  { label: 'Reports',         icon: 'bar_chart',       path: '/admin/reports' },
  { label: 'Slot Blocking',   icon: 'block',           path: '/admin/slots' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');

  const { data: profile } = await supabase
    .from('users').select('role, name').eq('id', session.user.id).single();

  if (!profile || profile.role !== 'admin') redirect('/staff/login?error=unauthorized');

  const name = profile.name || 'Super Admin';

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div>
            <h1 className="sidebar-brand">COVE</h1>
            <p className="sidebar-subtitle">Super Admin</p>
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

      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <Link href="/admin" className="mobile-brand">COVE</Link>
        <div className="mobile-top-bar-right">
          <span className="user-role mobile-user-role-badge">Admin</span>
          <StaffSidebarLogout />
        </div>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-bar">
        {NAV_ITEMS.slice(0, 4).map((item) => (
          <Link key={item.path} href={item.path} className="mobile-bottom-link">
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="mobile-bottom-link-text">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
