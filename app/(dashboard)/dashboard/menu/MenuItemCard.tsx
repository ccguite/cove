'use client';

import React, { useState } from 'react';
import type { MenuItem } from '@/lib/supabase/types';

type MenuItemCardProps = {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isAvailable: boolean) => Promise<void>;
};

export default function MenuItemCard({ item, onEdit, onDelete, onToggle }: MenuItemCardProps) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setToggling(true);
    try {
      await onToggle(item.id, e.target.checked);
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className="booking-history-card"
      style={{
        opacity: item.is_available ? 1 : 0.75,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      {/* Product Image Container */}
      <div
        className="product-image-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          height: '120px',
          backgroundColor: 'var(--color-surface-low)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image_url}
            alt={item.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
            className="hover-zoom-img"
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--color-text-disabled)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
              image_not_supported
            </span>
            <span style={{ display: 'block', fontSize: 'var(--text-size-label-sm)' }}>No Image Added</span>
          </div>
        )}

        {/* Stock status badge overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(254, 249, 241, 0.9)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: 'var(--shadow-sm)',
            fontSize: 'var(--text-size-label-sm)',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: item.is_available ? 'var(--color-success)' : 'var(--color-error)',
            }}
          ></div>
          <span style={{ color: 'var(--color-text-primary)' }}>
            {item.is_available ? 'In Stock' : 'Sold Out'}
          </span>
        </div>

        {/* Seasonal badge overlay */}
        {item.is_seasonal && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'var(--color-secondary-container)',
              color: 'var(--color-primary)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Seasonal
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-1)' }}>
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-size-body-lg)',
              color: 'var(--color-text-heading)',
              margin: 0,
              fontWeight: 600,
            }}
          >
            {item.name}
          </h4>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-size-body-md)',
              fontWeight: 700,
              color: 'var(--color-primary)',
            }}
          >
            ₹{item.price}
          </span>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-size-body-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.4',
            margin: 'var(--space-1) 0 var(--space-2) 0',
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description || 'No description provided.'}
        </p>

        {/* Availability Toggle and Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: 'var(--space-2)',
            marginTop: 'auto',
          }}
        >
          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={item.is_available}
              onChange={handleToggle}
              disabled={toggling}
              suppressHydrationWarning={true}
              style={{
                width: '36px',
                height: '20px',
                appearance: 'none',
                backgroundColor: 'var(--color-surface-highest)',
                borderRadius: 'var(--radius-full)',
                position: 'relative',
                outline: 'none',
                cursor: toggling ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease',
              }}
              className="status-toggle-checkbox"
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-size-label-sm)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >
              Available
            </span>
          </label>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onEdit(item)}
              title="Edit Item"
              suppressHydrationWarning={true}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                edit
              </span>
            </button>
            <button
              onClick={() => onDelete(item.id)}
              title="Delete Item"
              suppressHydrationWarning={true}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                delete
              </span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
