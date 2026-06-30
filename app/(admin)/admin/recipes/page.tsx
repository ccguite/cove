import React from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseStaffServerClient } from '@/lib/supabase/serverClient';
import RecipesClient from './RecipesClient';

export const metadata = { title: 'Recipes — COVE Admin' };

export default async function AdminRecipesPage() {
  const supabase = createSupabaseStaffServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/staff/login');

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', session.user.id).single();
  if (!profile || profile.role !== 'admin') redirect('/staff/login?error=unauthorized');

  // Fetch all menu items to populate the recipe selector
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name, category_id')
    .order('name');

  // Fetch all categories for grouping
  const { data: categories } = await supabase
    .from('menu_categories')
    .select('id, name')
    .order('display_order');

  return (
    <div>
      <div className="dashboard-page-header">
        <h2 className="dashboard-page-title">Recipes</h2>
        <p className="dashboard-page-subtitle">
          Store and manage kitchen recipes for every menu item. Reference for staff preparation.
        </p>
      </div>
      <RecipesClient
        menuItems={(menuItems || []) as { id: string; name: string; category_id: string }[]}
        categories={(categories || []) as { id: string; name: string }[]}
      />
    </div>
  );
}
