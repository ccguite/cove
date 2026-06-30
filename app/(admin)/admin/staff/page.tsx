import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import StaffClient from '../../../(dashboard)/dashboard/staff/StaffClient';

export const metadata = { title: 'Staff Management — COVE Admin' };

export default async function AdminStaffPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');
  const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/staff/login?error=unauthorized');

  const { data: staffList } = await supabase
    .from('users')
    .select('id, email, name, role, created_at')
    .in('role', ['admin', 'reception', 'kitchen'])
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Staff Management</h2>
        <p className="dashboard-page-subtitle">Create and manage staff accounts. Only admins can create or modify staff credentials.</p>
      </div>
      <StaffClient initialStaffList={staffList || []} currentUserId={session.user.id} />
    </div>
  );
}
