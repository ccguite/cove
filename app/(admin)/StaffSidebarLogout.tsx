'use client';

import React from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

export default function StaffSidebarLogout({ redirectTo = '/staff/login' }: { redirectTo?: string }) {
  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {}
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token') || key === 'cove-user')) {
          localStorage.removeItem(key);
        }
      }
    } catch {}
    try {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });
    } catch {}
    window.location.href = redirectTo;
  };

  return (
    <button onClick={handleLogout} className="btn-sidebar-logout" title="Log Out" aria-label="Log out">
      <span className="material-symbols-outlined">logout</span>
    </button>
  );
}
