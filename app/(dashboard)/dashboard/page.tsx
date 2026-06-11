import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';

export const metadata = {
  title: 'Dashboard Overview — COVE',
  description: 'COVE staff dashboard and admin panel.',
};

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  // Get active session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login?next=/dashboard');
  }

  // Fetch user profile and role
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !userProfile) {
    redirect('/');
  }

  const name = userProfile.name || 'Staff Member';
  const role = userProfile.role;

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Dashboard Overview</h2>
        <p className="dashboard-page-subtitle">
          Welcome back, {name}! Your role is configured as <strong>{role}</strong>.
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-md)',
        marginTop: 'var(--space-6)'
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-size-headline-sm)',
          color: 'var(--color-text-heading)',
          marginBottom: 'var(--space-2)'
        }}>
          System Status
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-size-body-md)',
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--text-lh-body-md)'
        }}>
          All backend systems are active. Row-Level Security (RLS) is enabled. 
          Real-time order subscriptions will be configured in Unit 12. 
          Use the left sidebar navigation (desktop) or top role badge (mobile) to navigate options.
        </p>
      </div>
    </div>
  );
}
