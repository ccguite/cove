import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { createSupabasePublicClient } from '@/lib/supabase/serverClient';
import type { MenuItem, MenuCategory } from '@/lib/supabase/types';
import MenuPageClient from './MenuPageClient';
import './page.css';

export const metadata: Metadata = {
  title: 'Korean-Inspired Café Menu — COVE',
  description: 'Explore the COVE food and drink menu in Aizawl, Mizoram. Browse specialty coffees, Korean iced lattes, fresh pastries, mocktails, and seasonal treats.',
  openGraph: {
    title: 'Korean-Inspired Café Menu — COVE',
    description: 'Explore the COVE food and drink menu in Aizawl, Mizoram. Browse specialty coffees, Korean iced lattes, fresh pastries, mocktails, and seasonal treats.',
    images: [
      {
        url: '/images/og-menu.jpg',
        width: 1200,
        height: 630,
        alt: 'COVE Café Menu',
      },
    ],
  },
};

export default async function MenuPage() {
  let categories: MenuCategory[] = [];
  let items: MenuItem[] = [];
  let errorMsg = '';

  try {
    const supabase = createSupabasePublicClient();
    
    // Fetch active categories
    const { data: catData, error: catErr } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (catErr) throw catErr;
    categories = catData as MenuCategory[];

    // Fetch menu items
    const { data: itemData, error: itemErr } = await supabase
      .from('menu_items')
      .select('*')
      .eq('only_for_rooms', false)
      .order('name', { ascending: true });

    if (itemErr) throw itemErr;
    items = itemData as MenuItem[];

    // Filter categories that have at least one active item
    const activeCategoryIds = new Set(items.map(item => item.category_id));
    categories = categories.filter(cat => activeCategoryIds.has(cat.id));
  } catch (e: any) {
    errorMsg = e.message || 'Failed to query database';
  }

  if (errorMsg) {
    return (
      <div className="menu-page-container">
        <p className="menu-error">Error: {errorMsg}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="menu-page-container"><div className="menu-empty">Loading café menu...</div></div>}>
      <MenuPageClient categories={categories} items={items} />
    </Suspense>
  );
}
