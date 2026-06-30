'use client';

import React, { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

export default function RealtimeNotificationWrapper({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Subscribe to new confirmed bookings and food orders
    const channel = supabase
      .channel('live-ops-alerts')
      // 1. Listen for new orders inserted (placed)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.new.status === 'placed') {
            triggerAlert(`New standalone food order placed! Total: ₹${payload.new.total_price}`);
          }
        }
      )
      // 2. Listen for order updates transitioning to placed (real webhook payment flow)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload: any) => {
          if (payload.old && payload.old.status === 'pending_payment' && payload.new.status === 'placed') {
            triggerAlert(`New standalone food order placed! Total: ₹${payload.new.total_price}`);
          }
        }
      )
      // 3. Listen for booking inserts confirmed
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload: any) => {
          if (payload.new.status === 'confirmed') {
            triggerAlert(`New room booking confirmed for ${payload.new.date}!`);
          }
        }
      )
      // 4. Listen for booking updates transitioning to confirmed (real webhook payment flow)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings' },
        (payload: any) => {
          if (payload.old && payload.old.status === 'pending_payment' && payload.new.status === 'confirmed') {
            triggerAlert(`New room booking confirmed for ${payload.new.date}!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const triggerAlert = (msg: string) => {
    setToast({ show: true, message: msg });
    
    // Play alert sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch((e) => console.log('Audio playback prevented by browser:', e));

    // Auto-hide toast after 5 seconds
    setTimeout(() => setToast({ show: false, message: '' }), 5000);
  };

  return (
    <>
      {children}
      {toast.show && (
        <div className="floating-dashboard-toast">
          <span className="material-symbols-outlined">notifications</span>
          <p>{toast.message}</p>
        </div>
      )}
    </>
  );
}
