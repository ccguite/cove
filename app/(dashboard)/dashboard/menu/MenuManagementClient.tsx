'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem, MenuCategory } from '@/lib/supabase/types';
import MenuItemCard from './MenuItemCard';
import dynamic from 'next/dynamic';

const MenuModal = dynamic(() => import('./MenuModal'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading editor...</div>,
});

type MenuManagementClientProps = {
  initialItems: MenuItem[];
  categories: MenuCategory[];
};

export default function MenuManagementClient({ initialItems, categories }: MenuManagementClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'sold_out'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync state with server props when they change
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Handle stock toggling
  const handleToggle = useCallback(async (id: string, isAvailable: boolean) => {
    setError(null);
    try {
      const res = await fetch('/api/admin/menu/toggle-availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isAvailable }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to toggle availability');
      }
      
      // Update local state immediately
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_available: isAvailable } : item))
      );
      
      // Refresh router to sync server components/cache
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle availability';
      setError(msg);
      throw err; // Re-throw to restore toggle loading state in the card
    }
  }, [router]);

  // Handle showing delete confirm modal
  const handleDeleteClick = useCallback((id: string) => {
    setDeletingItemId(id);
  }, []);

  // Handle actual deletion confirm
  const handleDeleteConfirm = useCallback(async (id: string) => {
    setError(null);
    setDeletingItemId(null);
    try {
      const res = await fetch('/api/admin/menu/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to delete menu item');
      }

      // Update local state
      setItems((prev) => prev.filter((item) => item.id !== id));
      
      // Refresh router to sync server state
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete menu item';
      setError(msg);
    }
  }, [router]);

  // Handle opening modal for creating
  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing
  const handleEditClick = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  // Handle modal save callback
  const handleModalSave = async () => {
    // Refresh page data (which updates initialItems and triggers the useEffect sync)
    router.refresh();
  };

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Category Filter
      if (selectedCategory && item.category_id !== selectedCategory) {
        return false;
      }
      // 2. Search Filter
      if (searchQuery.trim() && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // 3. Stock Status Filter
      if (stockFilter === 'in_stock' && !item.is_available) {
        return false;
      }
      if (stockFilter === 'sold_out' && item.is_available) {
        return false;
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery, stockFilter]);

  return (
    <div className="menu-management-container" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-md)', color: 'var(--color-text-heading)', margin: 0 }}>
            Menu Management
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)', margin: 'var(--space-1) 0 0 0' }}>
            Add, update, delete products or toggle availability in real-time.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="empty-state-btn"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-on-primary)',
            padding: 'var(--space-3) var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
          Add New Item
        </button>
      </div>

      {error && (
        <div className="form-error-message" style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      {/* Category Tabs */}
      <div
        className="mobile-category-bar"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--color-border-subtle)',
          scrollbarWidth: 'none'
        }}
      >
        <button
          onClick={() => setSelectedCategory('')}
          className={`mobile-cat-btn ${!selectedCategory ? 'active' : ''}`}
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-size-label-sm)',
            fontWeight: 600,
            backgroundColor: !selectedCategory ? 'var(--color-primary)' : 'var(--color-surface-low)',
            color: !selectedCategory ? 'var(--color-text-on-primary)' : 'var(--color-text-secondary)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          All Offerings
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`mobile-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-size-label-sm)',
              fontWeight: 600,
              backgroundColor: selectedCategory === cat.id ? 'var(--color-primary)' : 'var(--color-surface-low)',
              color: selectedCategory === cat.id ? 'var(--color-text-on-primary)' : 'var(--color-text-secondary)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search & Stock Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', fontSize: '20px' }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search items by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            suppressHydrationWarning={true}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-white)',
              fontSize: 'var(--text-size-body-md)',
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
        </div>

        <div style={{ flex: '0 0 180px' }}>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'all' | 'in_stock' | 'sold_out')}
            suppressHydrationWarning={true}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-white)',
              fontSize: 'var(--text-size-body-md)',
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'auto'
            }}
          >
            <option value="all">All States</option>
            <option value="in_stock">In Stock Only</option>
            <option value="sold_out">Sold Out Only</option>
          </select>
        </div>
      </div>

      {/* Grid of cards */}
      {filteredItems.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-12) 0', textAlign: 'center' }}>
          <span className="material-symbols-outlined empty-state-icon" style={{ fontSize: '48px', color: 'var(--color-text-disabled)' }}>
            inventory
          </span>
          <p className="empty-state-text" style={{ marginTop: 'var(--space-2)' }}>
            No items matched your active filters.
          </p>
        </div>
      ) : (
        <div className="menu-items-grid">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Menu Modal Form dialog */}
      <MenuModal
        isOpen={isModalOpen}
        item={editingItem}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />

      {/* Premium Deletion Confirmation Modal Overlay */}
      {deletingItemId && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(50, 48, 43, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface-white)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-6)',
            width: '100%', maxWidth: '400px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-size-headline-sm)', color: 'var(--color-text-heading)', margin: '0 0 var(--space-3) 0', fontWeight: 600 }}>
              Confirm Deletion
            </h4>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-6) 0', lineHeight: '1.5' }}>
              Are you sure you want to delete this menu item? This will permanently remove the record and delete its associated image from Supabase Storage.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                onClick={() => setDeletingItemId(null)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-primary)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-size-label-sm)',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingItemId)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--color-error)',
                  color: 'var(--color-text-on-primary)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-size-label-sm)',
                  fontWeight: 600
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
