import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import type { MenuItem, MenuCategory } from '@/lib/supabase/types';
import MenuManagementClient from '../../../(dashboard)/dashboard/menu/MenuManagementClient';

export const metadata = { title: 'Menu Management — COVE Admin' };

export default async function AdminMenuPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');
  const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/staff/login?error=unauthorized');

  const { data: categories } = await supabase.from('menu_categories').select('*').order('display_order');
  const { data: items } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Menu Management</h2>
        <p className="dashboard-page-subtitle">Add, edit, and remove menu items. Toggle availability and seasonal status.</p>
      </div>
      <MenuManagementClient categories={(categories || []) as MenuCategory[]} initialItems={(items || []) as MenuItem[]} />
    </div>
  );
}
