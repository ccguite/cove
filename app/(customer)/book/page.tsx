import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import type { Room, MenuItem } from '@/lib/supabase/types';
import BookingPageClient from './BookingPageClient';
import './page.css';

export const metadata: Metadata = {
  title: 'Book a Private Lounge — COVE',
  description: 'Select and book Husk (Couple lounge) or Haven (Group lounge) experience spaces at COVE café in Aizawl, Mizoram.',
};

export default async function BookingPage() {
  let dbRooms: Room[] = [];
  let dbMenu: MenuItem[] = [];

  try {
    const supabase = createSupabaseServerClient();
    
    // 1. Fetch rooms
    const roomsRes = await supabase.from('rooms').select('*');
    if (roomsRes.data) {
      dbRooms = roomsRes.data as Room[];
    }

    // 2. Fetch menu items for pre-orders
    const menuRes = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true);
    if (menuRes.data) {
      dbMenu = menuRes.data as MenuItem[];
    }
  } catch (err) {
    console.error('Failed to load booking resources server-side:', err);
  }

  return (
    <Suspense fallback={<div className="stepper-wizard-page"><p className="slots-loading">Loading booking details...</p></div>}>
      <BookingPageClient initialRooms={dbRooms} initialMenuItems={dbMenu} />
    </Suspense>
  );
}
