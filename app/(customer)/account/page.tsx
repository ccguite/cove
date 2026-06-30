import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import PersonalDetailsForm from './PersonalDetailsForm';
import AccountTabs from './AccountTabs';
import './account.css';

export const metadata = {
  title: 'My Account — COVE',
  description: 'Manage your COVE café and lounge bookings, food orders, and personal details.',
};

export default async function AccountPage({ searchParams }: { searchParams?: { tab?: string } | Promise<{ tab?: string }> }) {
  const supabase = createSupabaseServerClient();
  
  // Resolve searchParams if it is a Promise (Next.js 15+)
  const resolvedParams = searchParams && ('then' in searchParams || searchParams instanceof Promise)
    ? await searchParams
    : searchParams;
  const tab = resolvedParams?.tab;
  
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

  // Fetch user bookings with room details and food preorders
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      *,
      rooms (name, slug),
      booking_food_items (
        quantity,
        unit_price,
        menu_items (name)
      )
    `)
    .eq('user_id', session.user.id)
    .order('date', { ascending: false });

  if (bookingsError) {
    console.error('Failed to load user bookings:', bookingsError);
  }

  // Fetch user standalone food orders
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        quantity,
        unit_price,
        menu_items (name)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Failed to load user orders:', ordersError);
  }

  const bookings = (bookingsData || []) as any[];
  const orders = (ordersData || []) as any[];

  return (
    <div className="account-page">


      <div className="account-container flex-grow pb-32 max-w-container-max mx-auto w-full" style={{ paddingLeft: 'var(--space-5)', paddingRight: 'var(--space-5)' }}>
        {/* Dashboard Header */}
        <div className="account-header">
          <h1 className="account-title">My Account</h1>
          <p className="account-subtitle">Welcome back, {name || 'Valued Customer'}.</p>
        </div>

        <div className="account-grid">
          {/* Sidebar - My Details */}
          <aside className="account-sidebar">
            <PersonalDetailsForm
              initialName={name}
              initialEmail={email}
              initialPhone={phone}
            />
          </aside>

          {/* Main Area - Bookings & Orders Tabs */}
          <div className="account-main">
            <AccountTabs bookings={bookings} orders={orders} defaultTab={tab} />
          </div>
        </div>
      </div>


    </div>
  );
}
