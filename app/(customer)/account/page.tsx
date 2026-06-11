import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import PersonalDetailsForm from './PersonalDetailsForm';
import LogoutButton from './LogoutButton';
import './account.css';

export const metadata = {
  title: 'My Account — COVE',
  description: 'Manage your COVE café and lounge bookings, food orders, and personal details.',
};

export default async function AccountPage() {
  const supabase = createSupabaseServerClient();
  
  // Get active session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login?next=/account');
  }

  // Fetch user profile from public.users
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !userProfile) {
    // If user profile is not found, we redirect to login to trigger creation, or show an error
    console.error('Failed to load user profile:', error);
  }

  const name = userProfile?.name || '';
  const email = userProfile?.email || '';
  const phone = userProfile?.phone || '';

  return (
    <div className="account-page">
      {/* Desktop Header */}
      <header className="hidden md:flex fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md justify-between items-center px-margin-desktop py-stack-sm max-w-container-max mx-auto shadow-sm" style={{ left: 0, right: 0 }}>
        <Link href="/" className="font-display-xl text-display-xl text-primary tracking-tighter" style={{ textDecoration: 'none', fontSize: 'var(--text-size-headline-md)', fontWeight: 700 }}>
          COVE
        </Link>
        <nav className="flex gap-stack-md font-label-md text-label-md tracking-widest" style={{ display: 'flex', gap: 'var(--space-6)' }}>
          <Link href="/" className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Home</Link>
          <Link href="/rooms" className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Rooms</Link>
          <Link href="/menu" className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80 transition-opacity duration-300" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Menu</Link>
        </nav>
        <Link href="/rooms" className="bg-primary-container text-on-primary rounded-xl px-6 py-2 font-label-md text-label-md hover:opacity-80 transition-opacity duration-300" style={{ textDecoration: 'none', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)', borderRadius: 'var(--radius-xl)' }}>
          Book Now
        </Link>
      </header>

      <main className="flex-grow pt-margin-mobile md:pt-margin-desktop pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full" style={{ paddingLeft: 'var(--space-5)', paddingRight: 'var(--space-5)' }}>
        {/* Dashboard Header */}
        <div className="account-header">
          <h1 className="account-title">My Account</h1>
          <p className="account-subtitle">Welcome back, {name || 'Valued Customer'}.</p>
        </div>

        <div className="account-grid">
          {/* Sidebar Profile */}
          <aside className="account-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                <span className="material-symbols-outlined">person</span>
              </div>
              <h2 className="profile-name">{name || 'Valued Customer'}</h2>
              <p className="profile-phone">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                {phone ? `+91 ${phone}` : 'No phone number'}
              </p>
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Bookings</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Points</span>
                </div>
              </div>
            </div>

            {/* Navigation options */}
            <nav className="sidebar-nav">
              <button className="sidebar-nav-btn active">
                <span className="material-symbols-outlined">person</span> Profile
              </button>
              <div className="sidebar-divider"></div>
              <LogoutButton />
            </nav>
          </aside>

          {/* Main Area */}
          <div className="account-main">
            {/* Upcoming Bookings */}
            <section>
              <div className="history-section-header">
                <h3 className="history-section-title">Upcoming Visits</h3>
              </div>
              
              <div className="empty-state">
                <span className="material-symbols-outlined empty-state-icon">book_online</span>
                <p className="empty-state-text">
                  No upcoming visits. Book a room now to enjoy our premium lounges.
                </p>
                <Link href="/rooms" className="empty-state-btn" style={{ textDecoration: 'none' }}>
                  Book a Room
                </Link>
              </div>
            </section>

            {/* Recent Orders */}
            <section>
              <div className="history-section-header">
                <h3 className="history-section-title">Recent Orders</h3>
              </div>
              
              <div className="empty-state">
                <span className="material-symbols-outlined empty-state-icon">receipt_long</span>
                <p className="empty-state-text">
                  No recent orders. Order food for takeaway or delivery.
                </p>
                <Link href="/menu" className="empty-state-btn" style={{ textDecoration: 'none' }}>
                  Order Food
                </Link>
              </div>
            </section>

            {/* Personal Details Form */}
            <PersonalDetailsForm
              initialName={name}
              initialEmail={email}
              initialPhone={phone}
            />
          </div>
        </div>
      </main>

      {/* Mobile navigation bottom bar */}
      <nav className="fixed bottom-0 w-full z-50 rounded-t-xl md:hidden bg-surface/90 backdrop-blur-lg shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] flex justify-around items-center h-16 px-margin-mobile pb-safe" style={{ position: 'fixed', bottom: 0, width: '100%', height: '64px', backgroundColor: 'var(--color-surface)', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 50, borderTop: '1px solid var(--color-border-subtle)' }}>
        <Link href="/" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 rounded-lg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-sm text-label-sm mt-1" style={{ fontSize: 'var(--text-size-label-sm)' }}>Home</span>
        </Link>
        <Link href="/rooms" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 rounded-lg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-label-sm text-label-sm mt-1" style={{ fontSize: 'var(--text-size-label-sm)' }}>Rooms</span>
        </Link>
        <Link href="/menu" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 rounded-lg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="font-label-sm text-label-sm mt-1" style={{ fontSize: 'var(--text-size-label-sm)' }}>Menu</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-primary)', textDecoration: 'none', backgroundColor: 'var(--color-secondary-container)', borderRadius: 'var(--radius-xl)' }}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-sm text-label-sm mt-1" style={{ fontSize: 'var(--text-size-label-sm)', fontWeight: 600 }}>Account</span>
        </Link>
      </nav>

      {/* Footer */}
      <footer className="w-full py-stack-lg bg-surface-container-lowest grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop max-w-container-max mx-auto mt-auto md:mb-0 mb-16" style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface-white)', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 'var(--container-max)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div className="font-headline-md text-headline-md text-primary" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-md)', color: 'var(--color-primary)' }}>COVE</div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Instagram</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Facebook</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-size-body-sm)' }}>
          © 2026 COVE Cafe &amp; Lounge. Aizawl, Mizoram.
        </div>
      </footer>
    </div>
  );
}
