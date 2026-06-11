import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import SidebarLogout from './SidebarLogout';
import './dashboard.css';

// Active link helper
// Since we are in a server component, we will parse pathname or handle active states in the sub-pages
// For simplicity, we can let pages render active items or define active state based on route prefixes in simple css or sub-components.
// Here we define the layout with the primary links.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();

  // 1. Get active session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login?next=/dashboard');
  }

  // 2. Fetch user profile and role
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !userProfile) {
    console.error('Error fetching dashboard user role:', error);
    redirect('/');
  }

  const role = userProfile.role;
  const name = userProfile.name || 'Staff Member';

  // Staff items
  const navItems = [
    { label: 'Overview', icon: 'dashboard', path: '/dashboard' },
    { label: 'Orders', icon: 'receipt_long', path: '/dashboard/orders' },
    { label: 'Bookings', icon: 'book_online', path: '/dashboard/bookings' },
    { label: 'Room Status', icon: 'meeting_room', path: '/dashboard/status' },
  ];

  // Admin items
  if (role === 'admin') {
    navItems.push(
      { label: 'Menu Management', icon: 'restaurant_menu', path: '/dashboard/menu' },
      { label: 'Staff', icon: 'badge', path: '/dashboard/staff' },
      { label: 'Reports', icon: 'bar_chart', path: '/dashboard/reports' },
      { label: 'Settings', icon: 'settings', path: '/dashboard/settings' }
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-brand">COVE</h1>
          <p className="sidebar-subtitle">
            {role === 'admin' ? 'Admin Panel' : 'Staff Dashboard'}
          </p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="sidebar-link"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{name}</span>
            <span className="user-role">{role}</span>
          </div>
          <SidebarLogout />
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <Link href="/" className="mobile-brand">COVE</Link>
        <span className="user-role" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 'var(--text-size-label-sm)' }}>
          {role}
        </span>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="mobile-bottom-bar">
        {/* Only show first 4 items on mobile bottom bar to prevent clutter */}
        {navItems.slice(0, 4).map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="mobile-bottom-link"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="mobile-bottom-link-text">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
