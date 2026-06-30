'use client';

import React from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

export default function SidebarLogout() {
  const handleLogout = async () => {
    // 1. Clear server-side session cookies
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Server-side logout fetch failed:', err);
    }

    // 2. Clear client memory session
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Client-side sign out failed:', err);
    }

    // 3. Clear all client-side storage & cookies
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token') || key === 'cove-user')) {
          localStorage.removeItem(key);
        }
      }
    } catch {}

    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token'))) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {}

    try {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
      });
    } catch {}

    // 4. Force a full browser page reload and redirect to home
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleLogout}
      className="btn-sidebar-logout"
      title="Log Out"
    >
      <span className="material-symbols-outlined">logout</span>
    </button>
  );
}
