import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
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
  const supabase = createSupabaseStaffServerClient();

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

  // Role label for display
  const roleLabel =
    role === 'admin' ? 'Admin Panel'
    : role === 'reception' ? 'Reception'
    : role === 'kitchen' ? 'Kitchen'
    : 'Staff Dashboard';

  // Build role-scoped nav items
  // Kitchen: Only Orders
  // Reception: Overview, Orders (read), Bookings, Room Status
  // Admin: Everything
  const navItems: { label: string; icon: string; path: string }[] = [];

  if (role === 'kitchen') {
    navItems.push(
      { label: 'Overview', icon: 'dashboard', path: '/dashboard' },
      { label: 'Orders', icon: 'receipt_long', path: '/dashboard/orders' },
    );
  } else if (role === 'reception') {
    navItems.push(
      { label: 'Overview', icon: 'dashboard', path: '/dashboard' },
      { label: 'Orders', icon: 'receipt_long', path: '/dashboard/orders' },
      { label: 'Bookings', icon: 'book_online', path: '/dashboard/bookings' },
      { label: 'Room Status', icon: 'meeting_room', path: '/dashboard/status' },
    );
  } else {
    // Admin: full access
    navItems.push(
      { label: 'Overview', icon: 'dashboard', path: '/dashboard' },
      { label: 'Orders', icon: 'receipt_long', path: '/dashboard/orders' },
      { label: 'Bookings', icon: 'book_online', path: '/dashboard/bookings' },
      { label: 'Room Status', icon: 'meeting_room', path: '/dashboard/status' },
      { label: 'Menu Management', icon: 'restaurant_menu', path: '/dashboard/menu' },
      { label: 'Staff', icon: 'badge', path: '/dashboard/staff' },
      { label: 'Reports', icon: 'bar_chart', path: '/dashboard/reports' },
      { label: 'Slot Blocking', icon: 'block', path: '/dashboard/slots' },
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div>
            <h1 className="sidebar-brand">COVE</h1>
            <p className="sidebar-subtitle">
              {roleLabel}
            </p>
          </div>
          <SidebarLogout />
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
      </aside>

      {/* Mobile Top Bar */}
      <div className="mobile-top-bar">
        <Link href="/" className="mobile-brand">COVE</Link>
        <div className="mobile-top-bar-right">
          <span className="user-role mobile-user-role-badge">
            {role}
          </span>
          <SidebarLogout />
        </div>
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
