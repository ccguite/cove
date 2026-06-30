'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import './recipes.css';

/* ─── Types ─────────────────────────────────────────────────────────── */

interface MenuItem {
  id: string;
  name: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface Recipe {
  id?: string;
  menu_item_id: string;
  prep_time: string;
  servings: string;
  difficulty: string;
  ingredients: string;
  method: string;
  allergens: string;
  notes: string;
}

type RecipeStore = Record<string, Recipe>;

const emptyDraft = (menuItemId: string): Recipe => ({
  menu_item_id: menuItemId,
  prep_time: '',
  servings: '',
  difficulty: '',
  ingredients: '',
  method: '',
  allergens: '',
  notes: '',
});

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

/* ─── Component ─────────────────────────────────────────────────────── */

export default function RecipesClient({
  menuItems,
  categories,
}: {
  menuItems: MenuItem[];
  categories: Category[];
}) {
  const supabase = createSupabaseBrowserClient();

  const [search, setSearch]         = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recipes, setRecipes]       = useState<RecipeStore>({});
  const [draft, setDraft]           = useState<Recipe | null>(null);
  const [saving, setSaving]         = useState(false);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  /* ── Load all recipes on mount ───────────────────────────────────── */
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipes')
        .select('*');
      if (!error && data) {
        const store: RecipeStore = {};
        data.forEach((r: any) => { store[r.menu_item_id] = r; });
        setRecipes(store);
      }
      setLoading(false);
    };
    fetchRecipes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Filtering ───────────────────────────────────────────────────── */
  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return menuItems.filter((i) => i.name.toLowerCase().includes(q));
  }, [menuItems, search]);

  const grouped = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    filteredItems.forEach((item) => {
      if (!map[item.category_id]) map[item.category_id] = [];
      map[item.category_id].push(item);
    });
    return map;
  }, [filteredItems]);

  /* ── Selection ───────────────────────────────────────────────────── */
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      setDraft(recipes[id] ? { ...recipes[id] } : emptyDraft(id));
    },
    [recipes]
  );

  /* ── Draft editing ───────────────────────────────────────────────── */
  const updateDraft = (field: keyof Recipe, value: string) => {
    setDraft((prev) => prev ? { ...prev, [field]: value } : null);
  };

  /* ── Save ────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!selectedId || !draft) return;
    setSaving(true);
    try {
      const existing = recipes[selectedId];
      if (existing?.id) {
        // Update
        const { error } = await supabase
          .from('recipes')
          .update({
            prep_time:   draft.prep_time,
            servings:    draft.servings,
            difficulty:  draft.difficulty || null,
            ingredients: draft.ingredients,
            method:      draft.method,
            allergens:   draft.allergens,
            notes:       draft.notes,
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('recipes')
          .insert({
            menu_item_id: selectedId,
            prep_time:    draft.prep_time,
            servings:     draft.servings,
            difficulty:   draft.difficulty || null,
            ingredients:  draft.ingredients,
            method:       draft.method,
            allergens:    draft.allergens,
            notes:        draft.notes,
          })
          .select()
          .single();
        if (error) throw error;
        if (data) draft.id = data.id;
      }
      setRecipes((prev) => ({ ...prev, [selectedId]: { ...draft } }));
      showToast('Recipe saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save recipe', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ──────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!selectedId) return;
    const existing = recipes[selectedId];
    if (!existing?.id) {
      // Nothing saved yet, just reset draft
      setDraft(emptyDraft(selectedId));
      return;
    }
    if (!confirm('Clear this recipe? This cannot be undone.')) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      setRecipes((prev) => {
        const next = { ...prev };
        delete next[selectedId];
        return next;
      });
      setDraft(emptyDraft(selectedId));
      showToast('Recipe cleared', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete recipe', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── Toast ───────────────────────────────────────────────────────── */
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  /* ── Derived ─────────────────────────────────────────────────────── */
  const selectedItem     = menuItems.find((i) => i.id === selectedId);
  const selectedCategory = selectedItem
    ? categories.find((c) => c.id === selectedItem.category_id)
    : null;
  const hasRecipe  = selectedId ? !!recipes[selectedId]?.id : false;
  const filledCount = Object.values(recipes).filter((r) => r.id).length;

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <>
      {/* Summary bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
        <span className="recipe-status-badge filled">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
          {filledCount} recipe{filledCount !== 1 ? 's' : ''} saved
        </span>
        <span className="recipe-status-badge empty">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>pending</span>
          {menuItems.length - filledCount} pending
        </span>
        {loading && (
          <span style={{ fontSize: 13, color: 'var(--color-text-disabled)', fontFamily: 'var(--font-body)' }}>
            Loading…
          </span>
        )}
      </div>

      <div className="recipes-layout">
        {/* ── Left Sidebar ───────────────────────────────────────────── */}
        <aside className="recipes-sidebar">
          <div className="recipes-sidebar-header">
            <input
              type="search"
              className="recipes-search-input"
              placeholder="Search menu items…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search menu items"
            />
          </div>

          {filteredItems.length === 0 ? (
            <p className="recipes-no-results">No items match your search.</p>
          ) : (
            categories.map((cat) => {
              const items = grouped[cat.id];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat.id} className="recipes-category-group">
                  <div className="recipes-category-label">{cat.name}</div>
                  {items.map((item) => {
                    const filled = !!recipes[item.id]?.id;
                    const active = selectedId === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`recipes-item-btn${active ? ' active' : ''}${filled ? ' has-recipe' : ''}`}
                        onClick={() => handleSelect(item.id)}
                        type="button"
                        aria-pressed={active}
                      >
                        <span className="recipes-item-dot" />
                        <span style={{ flex: 1 }}>{item.name}</span>
                        {filled && (
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 14, color: 'var(--color-success)', flexShrink: 0 }}
                            title="Recipe saved"
                          >
                            check_circle
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </aside>

        {/* ── Right: Recipe Editor ───────────────────────────────────── */}
        <section className="recipes-editor" aria-label="Recipe editor">
          {!selectedId ? (
            <div className="recipes-empty-state">
              <span className="material-symbols-outlined recipes-empty-icon">menu_book</span>
              <p className="recipes-empty-title">Select a menu item</p>
              <p className="recipes-empty-sub">
                Choose an item from the list to view or add its recipe.
              </p>
            </div>
          ) : draft ? (
            <>
              {/* Header */}
              <div className="recipes-editor-header">
                <div>
                  <p className="recipes-editor-title">{selectedItem?.name}</p>
                  <p className="recipes-editor-meta">
                    {selectedCategory?.name ?? 'Uncategorised'} ·{' '}
                    <span className={`recipe-status-badge ${hasRecipe ? 'filled' : 'empty'}`}>
                      {hasRecipe ? 'Recipe saved' : 'Not saved yet'}
                    </span>
                  </p>
                </div>
                <div className="recipes-editor-actions">
                  {hasRecipe && (
                    <button
                      type="button"
                      className="recipes-btn-delete"
                      onClick={handleDelete}
                      disabled={saving}
                      aria-label="Clear recipe"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    className="recipes-btn-save"
                    onClick={handleSave}
                    disabled={saving}
                    aria-label="Save recipe"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {saving ? 'hourglass_top' : 'save'}
                    </span>
                    {saving ? 'Saving…' : 'Save Recipe'}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="recipes-editor-body">
                {/* Meta row */}
                <div className="recipe-meta-row">
                  <div className="recipe-meta-field">
                    <label className="recipe-meta-label" htmlFor={`prep-${selectedId}`}>Prep Time</label>
                    <input
                      id={`prep-${selectedId}`}
                      type="text"
                      className="recipe-meta-input"
                      placeholder="e.g. 10 mins"
                      value={draft.prep_time}
                      onChange={(e) => updateDraft('prep_time', e.target.value)}
                    />
                  </div>
                  <div className="recipe-meta-field">
                    <label className="recipe-meta-label" htmlFor={`servings-${selectedId}`}>Servings</label>
                    <input
                      id={`servings-${selectedId}`}
                      type="text"
                      className="recipe-meta-input"
                      placeholder="e.g. 1 portion"
                      value={draft.servings}
                      onChange={(e) => updateDraft('servings', e.target.value)}
                    />
                  </div>
                  <div className="recipe-meta-field">
                    <label className="recipe-meta-label" htmlFor={`difficulty-${selectedId}`}>Difficulty</label>
                    <select
                      id={`difficulty-${selectedId}`}
                      className="recipe-meta-input"
                      value={draft.difficulty}
                      onChange={(e) => updateDraft('difficulty', e.target.value)}
                    >
                      <option value="">Select…</option>
                      {DIFFICULTY_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="recipe-section">
                  <label className="recipe-section-label" htmlFor={`ingredients-${selectedId}`}>
                    <span className="material-symbols-outlined">grocery</span>
                    Ingredients
                  </label>
                  <textarea
                    id={`ingredients-${selectedId}`}
                    className="recipe-textarea"
                    rows={6}
                    placeholder={`List ingredients, one per line.\ne.g.\n- 2 shots espresso\n- 150ml steamed milk\n- 1 tsp sugar`}
                    value={draft.ingredients}
                    onChange={(e) => updateDraft('ingredients', e.target.value)}
                  />
                </div>

                {/* Method */}
                <div className="recipe-section">
                  <label className="recipe-section-label" htmlFor={`method-${selectedId}`}>
                    <span className="material-symbols-outlined">format_list_numbered</span>
                    Preparation Method
                  </label>
                  <textarea
                    id={`method-${selectedId}`}
                    className="recipe-textarea"
                    rows={7}
                    placeholder={`Step-by-step instructions.\ne.g.\n1. Pull a double espresso shot.\n2. Steam milk to 65°C.\n3. Pour milk over espresso.`}
                    value={draft.method}
                    onChange={(e) => updateDraft('method', e.target.value)}
                  />
                </div>

                {/* Allergens */}
                <div className="recipe-section">
                  <label className="recipe-section-label" htmlFor={`allergens-${selectedId}`}>
                    <span className="material-symbols-outlined">warning</span>
                    Allergens
                  </label>
                  <textarea
                    id={`allergens-${selectedId}`}
                    className="recipe-textarea"
                    rows={2}
                    placeholder="e.g. Contains: Dairy, Gluten, Nuts"
                    value={draft.allergens}
                    onChange={(e) => updateDraft('allergens', e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="recipe-section">
                  <label className="recipe-section-label" htmlFor={`notes-${selectedId}`}>
                    <span className="material-symbols-outlined">sticky_note_2</span>
                    Kitchen Notes
                  </label>
                  <textarea
                    id={`notes-${selectedId}`}
                    className="recipe-textarea"
                    rows={3}
                    placeholder="Additional tips, plating notes, or serving suggestions…"
                    value={draft.notes}
                    onChange={(e) => updateDraft('notes', e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : null}
        </section>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="recipes-toast"
          role="status"
          aria-live="polite"
          style={toast.type === 'error' ? { background: 'var(--color-error)', color: '#fff' } : undefined}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toast.msg}
        </div>
      )}
    </>
  );
}
