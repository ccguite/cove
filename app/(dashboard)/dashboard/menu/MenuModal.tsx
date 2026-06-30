'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { MenuItem, MenuCategory } from '@/lib/supabase/types';

type MenuModalProps = {
  isOpen: boolean;
  item: MenuItem | null; // Null when creating
  categories: MenuCategory[];
  onClose: () => void;
  onSave: () => Promise<void>;
};

export default function MenuModal({ isOpen, item, categories, onClose, onSave }: MenuModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageCleared, setImageCleared] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateImagePreview = (newUrl: string | null) => {
    setImagePreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev);
      }
      return newUrl;
    });
  };

  // Sync state with item when editing/creating opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setName(item?.name || '');
      setCategoryId(item?.category_id || categories[0]?.id || '');
      setDescription(item?.description || '');
      setPrice(item?.price ? String(item.price) : '');
      setIsSeasonal(item?.is_seasonal || false);
      setNewImageFile(null);
      setImagePreviewUrl(item?.image_url || null);
      setImageCleared(false);
    } else {
      // Revoke any blob URL on close
      setImagePreviewUrl((prev) => {
        if (prev && prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    }
  }, [isOpen, item, categories]);

  // Clean up blob URL on component unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setNewImageFile(file);
        updateImagePreview(URL.createObjectURL(file));
        setImageCleared(false);
      } else {
        setError('Please drop an image file.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImageFile(file);
      updateImagePreview(URL.createObjectURL(file));
      setImageCleared(false);
    }
  };

  const clearImage = () => {
    setNewImageFile(null);
    updateImagePreview(null);
    setImageCleared(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (!categoryId) {
      setError('Please select a Category.');
      return;
    }
    const numPrice = parseInt(price, 10);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const url = item ? '/api/admin/menu/update' : '/api/admin/menu/create';
      const method = item ? 'PATCH' : 'POST';

      const formData = new FormData();
      if (item) {
        formData.append('id', item.id);
      }
      formData.append('name', name.trim());
      formData.append('categoryId', categoryId);
      formData.append('description', description.trim());
      formData.append('price', String(numPrice));
      formData.append('isSeasonal', isSeasonal ? 'true' : 'false');

      if (newImageFile) {
        formData.append('image', newImageFile);
      } else if (item?.image_url) {
        formData.append('imageUrl', imageCleared ? 'null' : item.image_url);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save menu item');
      }

      await onSave();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save menu item';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(50, 48, 43, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface-white)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-size-headline-sm)',
              color: 'var(--color-text-heading)',
              margin: 0,
              fontWeight: 600,
            }}
          >
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)' }}>
          {error && (
            <div className="form-error-message" style={{ margin: '0 0 var(--space-4) 0', padding: 'var(--space-2)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Item Name */}
            <div className="form-field">
              <label className="form-label" htmlFor="itemName">Product Name</label>
              <input
                type="text"
                id="itemName"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                placeholder="e.g. Strawberry Croffle"
                required
              />
            </div>

            {/* Category and Price Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-field">
                <label className="form-label" htmlFor="itemCategory">Category</label>
                <select
                  id="itemCategory"
                  className="form-input"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={submitting}
                  required
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="itemPrice">Price (₹)</label>
                <input
                  type="number"
                  id="itemPrice"
                  className="form-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={submitting}
                  min="1"
                  placeholder="Price in Rs"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="form-label" htmlFor="itemDesc">Description</label>
              <textarea
                id="itemDesc"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
                placeholder="Brief description of ingredients or seasonal flavors..."
                style={{ resize: 'none' }}
              />
            </div>

            {/* Seasonal Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="itemSeasonal"
                checked={isSeasonal}
                onChange={(e) => setIsSeasonal(e.target.checked)}
                disabled={submitting}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="itemSeasonal" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-size-label-md)', color: 'var(--color-text-primary)', cursor: 'pointer', fontWeight: 500 }}>
                Mark as Seasonal Item
              </label>
            </div>

            {/* Image Upload Area */}
            <div className="form-field">
              <span className="form-label">Product Image</span>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-surface-low)',
                  cursor: 'pointer',
                  position: 'relative',
                  minHeight: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={submitting}
                />

                {imagePreviewUrl ? (
                  <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      style={{ height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '35%',
                        backgroundColor: 'var(--color-error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                      }}
                    >
                      ×
                    </button>
                    <span style={{ fontSize: 'var(--text-size-label-sm)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                      {newImageFile ? newImageFile.name : 'Current Image'} (Click to change)
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-text-disabled)' }}>
                      cloud_upload
                    </span>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                      Drag and drop image here or <strong>browse files</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              borderTop: '1px solid var(--color-border-subtle)',
              paddingTop: 'var(--space-4)',
              marginTop: 'var(--space-6)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="empty-state-btn"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="empty-state-btn"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
