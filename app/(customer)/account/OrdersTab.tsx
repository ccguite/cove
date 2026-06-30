'use client';

import React from 'react';
import Link from 'next/link';

type OrderItemWithMenu = {
  quantity: number;
  unit_price: number;
  menu_items: {
    name: string;
  } | null;
};

type OrderWithDetails = {
  id: string;
  type: 'takeaway' | 'delivery';
  status: 'placed' | 'preparing' | 'ready' | 'dispatched' | 'collected';
  total_price: number;
  delivery_address: string | null;
  created_at: string;
  order_items: OrderItemWithMenu[] | null;
};

type OrdersTabProps = {
  orders: OrderWithDetails[];
};

export default function OrdersTab({ orders }: OrdersTabProps) {
  const formatDate = (dateStr: string) => {
    try {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) {
        return 'Date Error';
      }
      return parsed.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Date Error';
    }
  };

  const getStatusClass = (status: OrderWithDetails['status']) => {
    switch (status) {
      case 'placed':
        return 'status-placed';
      case 'preparing':
      case 'dispatched':
        return 'status-preparing';
      case 'ready':
      case 'collected':
        return 'status-ready';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: OrderWithDetails['status']) => {
    switch (status) {
      case 'placed':
        return 'Placed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready';
      case 'dispatched':
        return 'Out for Delivery';
      case 'collected':
        return 'Completed';
      default:
        return status;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <span className="material-symbols-outlined empty-state-icon">receipt_long</span>
        <p className="empty-state-text">
          No past food orders. Order food for takeaway or delivery.
        </p>
        <Link href="/menu" className="empty-state-btn" style={{ textDecoration: 'none' }}>
          Order Food
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-history-container">
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const itemsList = order.order_items
                ? order.order_items
                    .map((item) => `${item.quantity}x ${item.menu_items?.name || 'Item'}`)
                    .join(', ')
                : 'No items';

              const isDelivery = order.type === 'delivery';

              return (
                <tr key={order.id}>
                  <td className="order-date-col">{formatDate(order.created_at)}</td>
                  <td className="order-type-col">
                    <span className="order-type-badge">
                      <span className="material-symbols-outlined">
                        {isDelivery ? 'local_shipping' : 'shopping_bag'}
                      </span>
                      {isDelivery ? 'Delivery' : 'Takeaway'}
                    </span>
                  </td>
                  <td className="order-items-col" title={itemsList}>
                    {itemsList}
                  </td>
                  <td className="order-total-col">₹{order.total_price}</td>
                  <td className="order-status-col">
                    <span className={`order-status-badge ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
