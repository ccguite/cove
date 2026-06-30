'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { getActiveOrdersClient } from '@/lib/orders/orderClientService';
import './orders-queue.css';

/* ─── Types ─────────────────────────────────────────────────────────── */

type OrderItem = {
  quantity: number;
  unit_price: number;
  menu_items: { name: string } | null;
};

type OrderWithItems = {
  id: string;
  user_id: string;
  type: 'takeaway' | 'delivery';
  status: 'placed' | 'preparing' | 'ready' | 'dispatched' | 'collected';
  total_price: number;
  delivery_address: string | null;
  created_at: string;
  order_items: OrderItem[] | null;
};

type Props = {
  initialOrders: OrderWithItems[];
  canUpdateStatus?: boolean;
};

/* ─── Helpers ────────────────────────────────────────────────────────── */

function getElapsedTime(createdAtStr: string, now: Date) {
  const diffMs = now.getTime() - new Date(createdAtStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  const hrs = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hrs}h ${mins}m`;
}

const STATUS_META: Record<
  OrderWithItems['status'],
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  placed:     { label: 'New Order',       color: '#7C4DFF', bg: '#EDE7F6', border: '#7C4DFF', icon: 'fiber_new' },
  preparing:  { label: 'Preparing',       color: '#E65100', bg: '#FFF3E0', border: '#FF9800', icon: 'skillet' },
  ready:      { label: 'Ready',           color: '#2E7D32', bg: '#E8F5E9', border: '#66BB6A', icon: 'check_circle' },
  dispatched: { label: 'Out for Delivery',color: '#01579B', bg: '#E1F5FE', border: '#29B6F6', icon: 'local_shipping' },
  collected:  { label: 'Completed',       color: '#4A3428', bg: '#F3EDE8', border: '#C98A3D', icon: 'done_all' },
};

const TYPE_META = {
  delivery: { label: 'Delivery',        icon: 'local_shipping' },
  takeaway: { label: 'Takeaway Pickup', icon: 'shopping_bag'   },
};

/* ─── Component ─────────────────────────────────────────────────────── */

export default function OrdersQueueClient({ initialOrders, canUpdateStatus = true }: Props) {
  const [orders, setOrders]               = useState<OrderWithItems[]>(initialOrders);
  const [loadingId, setLoadingId]         = useState<string | null>(null);
  const [now, setNow]                     = useState(new Date());
  const [flashId, setFlashId]             = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  /* ── Refresh ── */
  const refreshOrders = useCallback(async () => {
    try {
      const data = await getActiveOrdersClient();
      setOrders(data as OrderWithItems[]);
    } catch (err) {
      console.error('Failed to refresh orders:', err);
    }
  }, []);

  /* ── Clock ── */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  /* ── Realtime ── */
  useEffect(() => {
    const channel = supabase
      .channel('live-orders-queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refreshOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, refreshOrders]);

  /* ── Status transition ── */
  const handleTransition = async (orderId: string, nextStatus: string) => {
    setLoadingId(orderId);
    try {
      const res  = await fetch('/api/orders/status', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId, status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update order status');
      setFlashId(orderId);
      setTimeout(() => setFlashId(null), 800);
      await refreshOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setLoadingId(null);
    }
  };

  /* ── CTA button per status ── */
  const ActionButton = ({ order }: { order: OrderWithItems }) => {
    const busy = loadingId === order.id;

    const btn = (label: string, next: string, accent: string) => (
      <button
        className="oq-action-btn"
        style={{ '--btn-accent': accent } as React.CSSProperties}
        onClick={() => handleTransition(order.id, next)}
        disabled={busy}
      >
        {busy
          ? <span className="material-symbols-outlined oq-spin">progress_activity</span>
          : null}
        {busy ? 'Updating…' : label}
      </button>
    );

    switch (order.status) {
      case 'placed':     return btn('Start Preparing', 'preparing', 'var(--color-primary)');
      case 'preparing':  return btn('Mark Ready',      'ready',     'var(--color-accent)');
      case 'ready':      return order.type === 'delivery'
                           ? btn('Dispatch',           'dispatched','var(--color-secondary)')
                           : btn('Mark Collected',     'collected', 'var(--color-success)');
      case 'dispatched': return btn('Complete Delivery','collected','var(--color-success)');
      default:           return null;
    }
  };

  /* ── Render ── */
  return (
    <div className="oq-root">
      {/* Kanban header chips */}
      <div className="oq-summary-bar">
        {(['placed','preparing','ready','dispatched'] as const).map((s) => {
          const count = orders.filter(o => o.status === s).length;
          const meta  = STATUS_META[s];
          return (
            <div key={s} className="oq-summary-chip" style={{ '--chip-color': meta.color, '--chip-bg': meta.bg } as React.CSSProperties}>
              <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{meta.icon}</span>
              <span className="oq-summary-chip-label">{meta.label}</span>
              <span className="oq-summary-chip-count">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      {orders.length === 0 ? (
        <div className="oq-empty">
          <span className="material-symbols-outlined oq-empty-icon">coffee_maker</span>
          <p className="oq-empty-title">All caught up!</p>
          <p className="oq-empty-sub">No active orders right now. New orders will appear here instantly.</p>
        </div>
      ) : (
        <div className="oq-grid">
          {orders.map((order) => {
            const meta    = STATUS_META[order.status];
            const typeMeta = TYPE_META[order.type];
            const elapsed  = getElapsedTime(order.created_at, now);
            const isUrgent = (now.getTime() - new Date(order.created_at).getTime()) > 15 * 60000;
            const isFlash  = flashId === order.id;
            const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

            return (
              <div
                key={order.id}
                className={`oq-card${isFlash ? ' oq-card--flash' : ''}`}
                style={{ '--card-border': meta.border } as React.CSSProperties}
              >
                {/* Top accent bar */}
                <div className="oq-card-accent" style={{ background: meta.border }} />

                {/* Card header */}
                <div className="oq-card-header">
                  {/* Status badge */}
                  <span
                    className="oq-status-badge"
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{meta.icon}</span>
                    {meta.label}
                  </span>

                  {/* Elapsed timer */}
                  <span className={`oq-timer${isUrgent ? ' oq-timer--urgent' : ''}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                    {elapsed}
                  </span>
                </div>

                {/* Order ID + type */}
                <div className="oq-card-identity">
                  <span className="oq-order-id">#{order.id.substring(0, 8).toUpperCase()}</span>
                  <span className="oq-type-badge">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{typeMeta.icon}</span>
                    {typeMeta.label}
                  </span>
                </div>

                {/* Delivery address */}
                {order.delivery_address && (
                  <div className="oq-address">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                    <span>{order.delivery_address}</span>
                  </div>
                )}

                {/* Divider */}
                <div className="oq-divider" />

                {/* Items list */}
                <div className="oq-items">
                  <p className="oq-items-label">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>restaurant</span>
                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                  </p>
                  <ul className="oq-items-list">
                    {order.order_items?.map((item, idx) => (
                      <li key={idx} className="oq-item-row">
                        <span className="oq-item-qty">{item.quantity}×</span>
                        <span className="oq-item-name">{item.menu_items?.name ?? 'Café Item'}</span>
                        <span className="oq-item-price">₹{item.unit_price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="oq-card-footer">
                  <div className="oq-total">
                    <span className="oq-total-label">Total Paid</span>
                    <span className="oq-total-amount">₹{order.total_price}</span>
                  </div>
                  <div className="oq-actions">
                    {canUpdateStatus
                      ? <ActionButton order={order} />
                      : <span className="oq-viewonly">View Only</span>
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
