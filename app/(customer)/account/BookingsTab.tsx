'use client';

import React from 'react';
import Link from 'next/link';

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

type BookingsTabProps = {
  bookings: BookingWithDetails[];
};

export default function BookingsTab({ bookings }: BookingsTabProps) {
  const formatTimeRange = (start: string, duration: number) => {
    try {
      const [hours, minutes] = start.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + duration * 60;
      
      const format12 = (totalMin: number) => {
        const h = Math.floor(totalMin / 60) % 24;
        const m = totalMin % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const dispH = h % 12 || 12;
        return `${dispH}:${String(m).padStart(2, '0')} ${ampm}`;
      };
      
      return `${format12(hours * 60 + minutes)} - ${format12(totalMinutes)}`;
    } catch {
      return `${start} (${duration} hrs)`;
    }
  };

  const parseBookingDate = (dateStr: string) => {
    try {
      // Use local timezone parsing to prevent YYYY-MM-DD shifting on timezone offset
      const parsed = new Date(dateStr.replace(/-/g, '/'));
      // Fallback check for invalid date parsing
      if (isNaN(parsed.getTime())) {
        return { month: 'Date', day: '??' };
      }
      const month = parsed.toLocaleString('en-US', { month: 'short' });
      const day = parsed.getDate();
      return { month, day };
    } catch {
      return { month: 'Date', day: '??' };
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <span className="material-symbols-outlined empty-state-icon">book_online</span>
        <p className="empty-state-text">
          No past visits or bookings. Book a room now to enjoy our premium lounges.
        </p>
        <Link href="/rooms" className="empty-state-btn" style={{ textDecoration: 'none' }}>
          Book a Room
        </Link>
      </div>
    );
  }

  return (
    <div className="bookings-list">
      {bookings.map((booking) => {
        const { month, day } = parseBookingDate(booking.date);
        const isConfirmed = booking.status === 'confirmed';

        return (
          <div key={booking.id} className="booking-history-card">
            <div className="booking-card-main">
              <div className="booking-card-left">
                <span className={`booking-status-badge ${isConfirmed ? 'confirmed' : 'pending'}`}>
                  {isConfirmed ? 'Confirmed' : 'Pending Payment'}
                </span>
                <h4 className="booking-room-name">
                  {booking.rooms?.name || 'Private Room'}
                </h4>
                
                <div className="booking-card-details">
                  <p className="detail-item">
                    <span className="material-symbols-outlined">schedule</span>
                    {formatTimeRange(booking.start_time, booking.duration_hours)} ({booking.duration_hours}h)
                  </p>
                  <p className="detail-item">
                    <span className="material-symbols-outlined">group</span>
                    {booking.guest_count} {booking.guest_count === 1 ? 'Guest' : 'Guests'}
                  </p>
                </div>
              </div>

              <div className="booking-card-right">
                <div className="calendar-tile">
                  <span className="calendar-tile-month">{month}</span>
                  <span className="calendar-tile-day">{day}</span>
                </div>
              </div>
            </div>

            {booking.booking_food_items && booking.booking_food_items.length > 0 && (
              <div className="booking-food-preorders">
                <h5 className="preorder-title">Pre-ordered Food &amp; Drinks</h5>
                <ul className="preorder-items-list">
                  {booking.booking_food_items.map((item, idx) => (
                    <li key={idx} className="preorder-item">
                      • {item.quantity}x {item.menu_items?.name || 'Menu Item'} (₹{item.unit_price})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="booking-card-footer">
              <span className="booking-card-price">
                Total Paid: <strong>₹{booking.total_price}</strong>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
