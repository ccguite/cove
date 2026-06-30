'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { getTodaysBookingsClient } from '@/lib/orders/orderClientService';

type BookingFoodItem = {
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
  users: {
    name: string | null;
    phone: string | null;
  } | null;
  booking_food_items: BookingFoodItem[] | null;
};

type BookingsArrivalsClientProps = {
  initialBookings: BookingWithDetails[];
};

export default function BookingsArrivalsClient({ initialBookings }: BookingsArrivalsClientProps) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>(initialBookings);
  const [checkedInIds, setCheckedInIds] = useState<string[]>([]);
  const supabase = createSupabaseBrowserClient();

  // Offline booking form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [menuItemsList, setMenuItemsList] = useState<any[]>([]);
  
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [duration, setDuration] = useState(1);
  const [guestCount, setGuestCount] = useState(1);
  
  // Food selection states
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [foodQty, setFoodQty] = useState(1);
  const [addedFoodItems, setAddedFoodItems] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshBookings = useCallback(async () => {
    try {
      const dailyBookings = await getTodaysBookingsClient();
      setBookings(dailyBookings as BookingWithDetails[]);
    } catch (err) {
      console.error('Failed to refresh bookings:', err);
    }
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('live-bookings-arrivals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          refreshBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refreshBookings]);

  // Load rooms and menu items for offline booking form
  useEffect(() => {
    const loadResources = async () => {
      try {
        const { data: rooms } = await supabase.from('rooms').select('*').order('name');
        if (rooms) {
          setRoomsList(rooms);
          if (rooms.length > 0) {
            setSelectedRoomId(rooms[0].id);
            setGuestCount(rooms[0].min_pax);
          }
        }

        const { data: items } = await supabase.from('menu_items').select('*').eq('is_available', true).order('name');
        if (items) {
          setMenuItemsList(items);
          if (items.length > 0) {
            setSelectedFoodId(items[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load resources for offline booking:', err);
      }
    };
    loadResources();
  }, [supabase]);

  // Auto-initialize capacity bounds when room selection changes
  useEffect(() => {
    const room = roomsList.find(r => r.id === selectedRoomId);
    if (room) {
      setGuestCount(room.min_pax);
    }
  }, [selectedRoomId, roomsList]);

  // Toggle check-in in local state
  const handleCheckInToggle = (bookingId: string) => {
    setCheckedInIds(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId) 
        : [...prev, bookingId]
    );
  };

  const handleAddFoodItem = () => {
    if (!selectedFoodId) return;
    const item = menuItemsList.find(m => m.id === selectedFoodId);
    if (!item) return;

    setAddedFoodItems(prev => {
      const existing = prev.find(i => i.id === selectedFoodId);
      if (existing) {
        return prev.map(i => i.id === selectedFoodId ? { ...i, quantity: i.quantity + foodQty } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: foodQty }];
    });
    setFoodQty(1);
  };

  const handleRemoveFoodItem = (itemId: string) => {
    setAddedFoodItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleOfflineBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const room = roomsList.find(r => r.id === selectedRoomId);
    if (!room) {
      setFormError('Please select a room.');
      return;
    }

    if (guestCount < room.min_pax || guestCount > room.max_pax) {
      setFormError(`Guest count must be between ${room.min_pax} and ${room.max_pax} for room ${room.name}.`);
      return;
    }

    if (!/^\d{10}$/.test(guestPhone)) {
      setFormError('Guest phone number must be exactly 10 digits.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        guestName,
        guestPhone,
        roomId: selectedRoomId,
        date: bookingDate,
        startTime,
        duration,
        guestCount,
        foodItems: addedFoodItems.map(item => ({ id: item.id, quantity: item.quantity }))
      };

      const response = await fetch('/api/admin/bookings/create-offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to create offline booking');
      }

      // Success
      setIsModalOpen(false);
      // Reset form states
      setGuestName('');
      setGuestPhone('');
      setAddedFoodItems([]);
      await refreshBookings();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred.');
    } finally {
      setFormLoading(false);
    }
  };

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

  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  // Calculate pricing summaries in form
  const selectedRoom = roomsList.find(r => r.id === selectedRoomId);
  const roomPrice = selectedRoom ? selectedRoom.price_per_hour * duration : 0;
  const foodPrice = addedFoodItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const grandTotal = roomPrice + foodPrice;

  return (
    <div className="bookings-arrivals-container">
      <div className="history-section-header" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <h3 className="history-section-title">Today's Schedule</h3>
          <span style={{ fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
            {todayDateFormatted}
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="empty-state-btn"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'var(--color-text-on-amber)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--text-size-label-sm)',
            borderRadius: 'var(--radius-lg)',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          New Offline Booking
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <span className="material-symbols-outlined empty-state-icon">calendar_today</span>
          <p className="empty-state-text">No room bookings confirmed for today.</p>
        </div>
      ) : (
        <div className="orders-queue-grid">
          {bookings.map((booking) => {
            const isCheckedIn = checkedInIds.includes(booking.id);
            const guestName = booking.users?.name || 'Valued Guest';
            const guestPhone = booking.users?.phone ? `+91 ${booking.users.phone}` : 'No phone';

            return (
              <div key={booking.id} className="booking-history-card">
                <div className="booking-card-main">
                  <div className="booking-card-left">
                    <span className={`booking-status-badge ${isCheckedIn ? 'confirmed' : 'pending'}`} style={{
                      backgroundColor: isCheckedIn ? 'var(--color-success-container)' : 'var(--color-surface-low)',
                      color: isCheckedIn ? 'var(--color-success)' : 'var(--color-text-secondary)'
                    }}>
                      {isCheckedIn ? 'Checked In' : 'Confirmed'}
                    </span>
                    
                    <h4 className="booking-room-name" style={{ marginTop: '4px' }}>
                      {booking.rooms?.name || 'Private Room'}
                    </h4>

                    <div style={{
                      fontSize: 'var(--text-size-body-sm)',
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)',
                      marginTop: '2px'
                    }}>
                      <strong>Guest:</strong> {guestName} ({guestPhone})
                    </div>
                  </div>

                  <div className="booking-card-right">
                    <div className="calendar-tile" style={{ minWidth: '80px', height: '60px' }}>
                      <span className="calendar-tile-month" style={{ fontSize: 'var(--text-size-label-sm)' }}>pax</span>
                      <span className="calendar-tile-day" style={{ fontSize: 'var(--text-size-headline-sm)' }}>
                        {booking.guest_count}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="booking-card-details" style={{
                  borderTop: '1px solid var(--color-border-subtle)',
                  paddingTop: 'var(--space-3)',
                  marginTop: 'var(--space-2)'
                }}>
                  <p className="detail-item">
                    <span className="material-symbols-outlined">schedule</span>
                    {formatTimeRange(booking.start_time, booking.duration_hours)} ({booking.duration_hours}h)
                  </p>
                </div>

                {booking.booking_food_items && booking.booking_food_items.length > 0 && (
                  <div className="booking-food-preorders" style={{ borderTop: '1px dashed var(--color-border-subtle)' }}>
                    <h5 className="preorder-title">Pre-ordered Food &amp; Drinks</h5>
                    <ul className="preorder-items-list">
                      {booking.booking_food_items.map((item, idx) => (
                        <li key={idx} className="preorder-item">
                          • {item.quantity}x {item.menu_items?.name || 'Cafe Item'} (₹{item.unit_price})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="booking-card-footer" style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)' }}>
                  <span className="booking-card-price">
                    Total Paid: <strong>₹{booking.total_price}</strong>
                  </span>
                  
                  <button
                    onClick={() => handleCheckInToggle(booking.id)}
                    className="empty-state-btn"
                    style={{
                      backgroundColor: isCheckedIn ? 'var(--color-surface-high)' : 'var(--color-primary)',
                      color: isCheckedIn ? 'var(--color-primary)' : 'var(--color-text-on-primary)',
                      padding: 'var(--space-2) var(--space-4)',
                      fontSize: 'var(--text-size-label-sm)',
                      borderRadius: 'var(--radius-lg)',
                      border: isCheckedIn ? '1px solid var(--color-border)' : 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isCheckedIn ? 'Undo Check In' : 'Check In Guest'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW OFFLINE BOOKING MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--space-4)',
          overflowY: 'auto'
        }}>
          <div className="modal-container" style={{
            backgroundColor: 'var(--color-surface-white)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '650px',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            {/* Modal Header */}
            <div className="modal-header" style={{
              padding: 'var(--space-5)',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 className="modal-title" style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-size-headline-sm)',
                color: 'var(--color-text-heading)',
                margin: 0
              }}>New Offline Booking</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--color-text-secondary)' }}>close</span>
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleOfflineBookingSubmit} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flexGrow: 1 }}>
              <div className="modal-body" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {formError && (
                  <div className="error-message" role="alert" style={{
                    backgroundColor: 'var(--color-error-container)',
                    color: 'var(--color-error-on-container)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-size-body-sm)'
                  }}>
                    {formError}
                  </div>
                )}

                {/* Guest Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-field">
                    <label className="form-label" htmlFor="offline-name">Guest Name</label>
                    <input
                      type="text"
                      id="offline-name"
                      className="form-input"
                      placeholder="e.g. Rachel Lalrinsangi"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      disabled={formLoading}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="offline-phone">Guest Phone (10 digits)</label>
                    <input
                      type="tel"
                      id="offline-phone"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value.replace(/\D/g, ''))}
                      disabled={formLoading}
                      required
                    />
                  </div>
                </div>

                {/* Booking Room & Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-field">
                    <label className="form-label" htmlFor="offline-room">Select Space</label>
                    <select
                      id="offline-room"
                      className="form-input"
                      value={selectedRoomId}
                      onChange={e => setSelectedRoomId(e.target.value)}
                      disabled={formLoading}
                      style={{ appearance: 'auto' }}
                      required
                    >
                      {roomsList.map(r => (
                        <option key={r.id} value={r.id}>{r.name} (₹{r.price_per_hour}/hr)</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="offline-date">Reservation Date</label>
                    <input
                      type="date"
                      id="offline-date"
                      className="form-input"
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      disabled={formLoading}
                      required
                    />
                  </div>
                </div>

                {/* Time, Duration & Guests */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-field">
                    <label className="form-label" htmlFor="offline-time">Start Time</label>
                    <select
                      id="offline-time"
                      className="form-input"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      disabled={formLoading}
                      style={{ appearance: 'auto' }}
                      required
                    >
                      {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="offline-duration">Duration (hours)</label>
                    <select
                      id="offline-duration"
                      className="form-input"
                      value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      disabled={formLoading}
                      style={{ appearance: 'auto' }}
                      required
                    >
                      {[1, 2, 3, 4, 5].map(h => (
                        <option key={h} value={h}>{h} hr{h > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="offline-guests">Guest Count</label>
                    <input
                      type="number"
                      id="offline-guests"
                      className="form-input"
                      min={1}
                      value={guestCount}
                      onChange={e => setGuestCount(Number(e.target.value))}
                      disabled={formLoading}
                      required
                    />
                  </div>
                </div>

                {/* Food Pre-Orders Section */}
                <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-4)' }}>
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-size-body-lg)',
                    color: 'var(--color-text-heading)',
                    margin: '0 0 var(--space-2) 0'
                  }}>Add Food, Drinks &amp; Combo Packages</h4>

                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', marginBottom: 'var(--space-3)' }}>
                    <div style={{ flexGrow: 1 }} className="form-field">
                      <label className="form-label" htmlFor="offline-food">Select Menu Item / Combo</label>
                      <select
                        id="offline-food"
                        className="form-input"
                        value={selectedFoodId}
                        onChange={e => setSelectedFoodId(e.target.value)}
                        disabled={formLoading}
                        style={{ appearance: 'auto' }}
                      >
                        {menuItemsList.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.only_for_rooms ? '[ROOM COMBO] ' : ''}{m.name} (₹{m.price})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ width: '80px' }} className="form-field">
                      <label className="form-label" htmlFor="offline-food-qty">Qty</label>
                      <input
                        type="number"
                        id="offline-food-qty"
                        className="form-input"
                        min={1}
                        value={foodQty}
                        onChange={e => setFoodQty(Math.max(1, Number(e.target.value)))}
                        disabled={formLoading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFoodItem}
                      className="btn"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text-on-primary)',
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: 'var(--text-size-label-sm)',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        cursor: 'pointer',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {/* Added Food List */}
                  {addedFoodItems.length > 0 ? (
                    <div className="added-food-list" style={{
                      backgroundColor: 'var(--color-surface-low)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3)',
                      maxHeight: '120px',
                      overflowY: 'auto'
                    }}>
                      {addedFoodItems.map(item => (
                        <div key={item.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 'var(--space-1) 0',
                          fontSize: 'var(--text-size-body-sm)',
                          borderBottom: '1px solid rgba(0,0,0,0.05)'
                        }}>
                          <span>{item.quantity}x {item.name} (₹{item.price})</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFoodItem(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-error)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: 0 }}>
                      No food items added yet.
                    </p>
                  )}
                </div>

                {/* Grand Total Summary */}
                <div style={{
                  backgroundColor: 'var(--color-accent-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  marginTop: 'var(--space-2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-body)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)' }}>
                      Room Rent: ₹{roomPrice} | Food Orders: ₹{foodPrice}
                    </span>
                    <span style={{ fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      Offline Booking Summary
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 'var(--text-size-body-sm)', color: 'var(--color-text-secondary)' }}>Total to Collect</span>
                    <h4 style={{ margin: 0, color: 'var(--color-primary)', fontSize: 'var(--text-size-headline-sm)', fontWeight: 700 }}>
                      ₹{grandTotal}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{
                padding: 'var(--space-4) var(--space-5)',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)'
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn"
                  style={{
                    backgroundColor: 'var(--color-surface-high)',
                    color: 'var(--color-text-primary)',
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: 'var(--text-size-label-sm)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: 'var(--color-text-on-amber)',
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: 'var(--text-size-label-sm)',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
