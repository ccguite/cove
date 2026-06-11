'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';

export default function SidebarLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Failed to log out:', err);
    }
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
