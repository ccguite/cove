'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import './page.css';

interface OrderItem {
  quantity: number;
  unit_price: number;
  menu_items: {
    name: string;
  } | null;
}

interface OrderDetails {
  id: string;
  type: 'takeaway' | 'delivery';
  status: string;
  total_price: number;
  delivery_address: string | null;
  created_at: string;
  order_items: OrderItem[] | null;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is missing');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              unit_price,
              menu_items (name)
            )
          `)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data as OrderDetails);
      } catch (err: any) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, supabase]);

  if (loading) {
    return (
      <div className="confirmation-container loading-state">
        <div className="spinner"></div>
        <p>Verifying your payment and generating receipt...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="confirmation-container error-state">
        <span className="material-symbols-outlined error-icon">error</span>
        <h1>Order Not Found</h1>
        <p>{error || 'We could not retrieve details for this order.'}</p>
        <Link href="/menu" className="btn-return">
          Back to Cafe Menu
        </Link>
      </div>
    );
  }

  const isDelivery = order.type === 'delivery';

  return (
    <div className="confirmation-page">
      <div className="confirmation-card fade-in">
        {/* Success Icon */}
        <div className="success-icon-wrapper">
          <span className="material-symbols-outlined success-icon">check_circle</span>
        </div>

        <h1 className="confirmation-title">Order Placed Successfully!</h1>
        <p className="confirmation-subtitle">
          Thank you for ordering from COVE. Your order has been placed and sent to the kitchen.
        </p>

        {/* Order Details box */}
        <div className="details-box">
          <h2 className="details-box-title">Order Information</h2>
          
          <div className="details-row">
            <span className="row-label">Order Number</span>
            <span className="row-val font-mono">{order.id}</span>
          </div>

          <div className="details-row">
            <span className="row-label">Fulfillment Type</span>
            <span className="row-val capitalize">{order.type}</span>
          </div>

          {isDelivery && order.delivery_address && (
            <div className="details-row address-row">
              <span className="row-label">Delivery Address</span>
              <span className="row-val text-right">{order.delivery_address}</span>
            </div>
          )}

          <div className="details-row">
            <span className="row-label">Status</span>
            <span className="row-val badge status-placed">Placed</span>
          </div>

          <div className="details-divider"></div>

          {/* Items Summary list */}
          <div className="items-summary-list">
            <h3 className="items-summary-title">Items Ordered</h3>
            {order.order_items?.map((item, index) => (
              <div key={index} className="summary-item-row">
                <span className="summary-item-name">
                  {item.quantity}x {item.menu_items?.name || 'Menu Item'}
                </span>
                <span className="summary-item-total">
                  ₹{item.quantity * item.unit_price}
                </span>
              </div>
            ))}
          </div>

          <div className="details-divider"></div>

          <div className="details-row grand-total-row">
            <span className="row-label">Amount Paid</span>
            <span className="row-val">₹{order.total_price}</span>
          </div>
        </div>

        {/* Action Button Links */}
        <div className="action-links">
          <Link href="/account?tab=orders" className="btn-action-primary">
            View My Orders
          </Link>
          <Link href="/" className="btn-action-secondary">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <React.Suspense fallback={
      <div className="confirmation-container loading-state">
        <div className="spinner"></div>
        <p>Loading order status...</p>
      </div>
    }>
      <OrderConfirmationContent />
    </React.Suspense>
  );
}

