'use client';

import React, { useState, useEffect } from 'react';
import BookingsTab from './BookingsTab';
import OrdersTab from './OrdersTab';
import SettingsTab from './SettingsTab';

type BookingFoodItemWithMenu = {
  quantity: number;
  unit_price: number;
  menu_items: {
    name: string;
  } | null;
};

type BookingWithDetails = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  duration_hours: number;
  guest_count: number;
  total_price: number;
  status: 'pending_payment' | 'confirmed';
  rooms: {
    name: string;
    slug: string;
  } | null;
  booking_food_items: BookingFoodItemWithMenu[] | null;
};

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

type AccountTabsProps = {
  bookings: BookingWithDetails[];
  orders: OrderWithDetails[];
  defaultTab?: string;
};

export default function AccountTabs({ bookings, orders, defaultTab }: AccountTabsProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders' | 'settings'>(
    defaultTab === 'orders' ? 'orders' : defaultTab === 'settings' ? 'settings' : 'bookings'
  );

  useEffect(() => {
    if (defaultTab === 'orders') {
      setActiveTab('orders');
    } else if (defaultTab === 'bookings') {
      setActiveTab('bookings');
    } else if (defaultTab === 'settings') {
      setActiveTab('settings');
    }
  }, [defaultTab]);

  return (
    <div className="account-history-section">
      <div className="account-tabs">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`account-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>
            book_online
          </span>
          Past Visits &amp; Bookings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`account-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>
            receipt_long
          </span>
          Past Food Orders
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`account-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '6px' }}>
            settings
          </span>
          Settings
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'bookings' ? (
          <BookingsTab bookings={bookings} />
        ) : activeTab === 'orders' ? (
          <OrdersTab orders={orders} />
        ) : (
          <SettingsTab />
        )}
      </div>
    </div>
  );
}
