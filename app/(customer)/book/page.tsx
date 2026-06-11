'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/browserClient';
import type { Room, MenuItem } from '@/lib/supabase/types';
import './page.css';

// Local fallbacks matching database rooms
const STATIC_ROOMS: Room[] = [
  {
    id: '1', // placeholder replaced on fetch
    name: 'Husk',
    slug: 'husk',
    min_pax: 1,
    max_pax: 2,
    price_per_hour: 599,
    description: 'An intimate cocoon designed for deep conversations or focused duo work.',
    created_at: '',
  },
  {
    id: '2', // placeholder replaced on fetch
    name: 'Haven',
    slug: 'haven',
    min_pax: 3,
    max_pax: 8,
    price_per_hour: 1499,
    description: 'A spacious sanctuary perfect for creative workshops, small celebrations, or team alignments.',
    created_at: '',
  },
];

const ROOM_IMAGES: Record<string, string> = {
  husk: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxdJW0jE70YaSMOywv8UdVC4mTg6bP5Ro7ri0MpV8TWtF3mrbe9xTc6QoQA5YZnLeU3nx6U8SLZOC5VyofltWjuJ2Wlu3bzLY4Xo1fChfmLg31BZVWi7lnAYDd2XKp5Raq3qklNOmFsn8suMxidcaSJFIb9WDEv44t8Wfc0qhNk_LRN98XPUJrpwrRDLWSSnnIiSrRAKsK0H4EJswl_dywK_-ICXw_QzGXpGhI6MxqRYyttI9fkLvgY8J3JRIzTYJ3JY95OyeZtboX',
  haven: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf4ecYOtvDx-yw1DP6nGsI7Wlel9zFo0FTdv3L4GQY8-pJnG6o5X5H4LH0vIqvDyAAxwx4gZiVWvIiF0i7Bl2IEULGIMCGn9yzNYCab1HJzu1R5NH0dwZpxAqFo3s7PIljqdEo_xqkQd6oTN3Hu613ySqliujbIh7s7D5H87GST0YnA8OTrM4uHOe6oAfQm_TMu8XnBdV06Ellk9PrxTzzMcaVzWevGfVj9H6pn1hV1vIzn9u-gRvre4ooE-uxJRR30EzzIDTlMBXx',
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedRoomSlug = searchParams.get('room') || '';

  // Step state
  const [activeStep, setActiveStep] = useState<number>(1);
  const [error, setError] = useState<string>('');

  // Form states
  const [rooms, setRooms] = useState<Room[]>(STATIC_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [guestCount, setGuestCount] = useState<number>(1);
  
  // Food pre-order states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [preOrderCart, setPreOrderCart] = useState<Map<string, number>>(new Map());

  // API slot check state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Load rooms and menu items from Supabase
  useEffect(() => {
    async function loadData() {
      // 1. Fetch real rooms from DB
      const { data: dbRooms } = await supabase.from('rooms').select('*');
      if (dbRooms && dbRooms.length > 0) {
        setRooms(dbRooms as Room[]);
        
        // Auto-select room if passed via query params
        if (preSelectedRoomSlug) {
          const matched = dbRooms.find((r: Room) => r.slug === preSelectedRoomSlug);
          if (matched) setSelectedRoom(matched);
        }
      } else {
        // Fallback selections
        if (preSelectedRoomSlug) {
          const matched = STATIC_ROOMS.find((r) => r.slug === preSelectedRoomSlug);
          if (matched) setSelectedRoom(matched);
        }
      }

      // 2. Fetch menu items for pre-orders
      const { data: dbMenu } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true);
      if (dbMenu) {
        setMenuItems(dbMenu as MenuItem[]);
      }
    }

    loadData();

    // 3. Inject Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [preSelectedRoomSlug]);

  // Fetch available slots when room or date changes
  useEffect(() => {
    if (!selectedRoom || !date) return;

    async function fetchAvailableSlots() {
      setIsLoadingSlots(true);
      setStartTime(''); // Reset slot on change
      try {
        const res = await fetch(`/api/bookings/available-slots?roomId=${selectedRoom!.id}&date=${date}`);
        const result = await res.json();
        if (result.data?.availableSlots) {
          setAvailableSlots(result.data.availableSlots);
        } else {
          setAvailableSlots([]);
        }
      } catch {
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchAvailableSlots();
  }, [selectedRoom, date]);

  // End time calculator helper
  const calculateEndTimeStr = () => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHour = Math.floor(totalMinutes / 60);
    const endMin = totalMinutes % 60;
    const period = endHour >= 12 ? 'PM' : 'AM';
    const dispHour = endHour > 12 ? endHour - 12 : endHour;
    return `${dispHour}:${String(endMin).padStart(2, '0')} ${period}`;
  };

  const isEndTimePastBoundary = () => {
    if (!startTime) return false;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + durationHours * 60;
    const closingMinutes = 23 * 60; // 11:00 PM
    return endMinutes > closingMinutes;
  };

  // Stepper handlers
  const handleNextStep = () => {
    setError('');
    if (activeStep === 1) {
      if (!selectedRoom) {
        setError('Please select a room to continue.');
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!date || !startTime) {
        setError('Please choose a valid date and start time slot.');
        return;
      }
      if (isEndTimePastBoundary()) {
        setError('The reservation cannot extend past our 11:00 PM closing cutoff.');
        return;
      }
      // Set default guest count to min capacity
      setGuestCount(selectedRoom!.min_pax);
      setActiveStep(3);
    } else if (activeStep === 3) {
      const count = Number(guestCount);
      if (count < selectedRoom!.min_pax || count > selectedRoom!.max_pax) {
        setError(`Guest count must be between ${selectedRoom!.min_pax} and ${selectedRoom!.max_pax} for this space.`);
        return;
      }
      setActiveStep(4);
    } else if (activeStep === 4) {
      setActiveStep(5);
    }
  };

  const handleBackStep = () => {
    setError('');
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  // Food quantities updater
  const updateCartQty = (itemId: string, increment: boolean) => {
    const nextCart = new Map(preOrderCart);
    const current = nextCart.get(itemId) || 0;
    if (increment) {
      nextCart.set(itemId, current + 1);
    } else {
      if (current <= 1) {
        nextCart.delete(itemId);
      } else {
        nextCart.set(itemId, current - 1);
      }
    }
    setPreOrderCart(nextCart);
  };

  // Price calculations
  const getRoomSubtotal = () => {
    if (!selectedRoom) return 0;
    return selectedRoom.price_per_hour * durationHours;
  };

  const getFoodSubtotal = () => {
    let total = 0;
    preOrderCart.forEach((qty, itemId) => {
      const item = menuItems.find(m => m.id === itemId);
      if (item) total += item.price * qty;
    });
    return total;
  };

  const getConvenienceFees = () => {
    const subtotal = getRoomSubtotal() + getFoodSubtotal();
    return Math.round(subtotal * 0.05); // 5% flat fee
  };

  const getGrandTotal = () => {
    return getRoomSubtotal() + getFoodSubtotal() + getConvenienceFees();
  };

  // Initiate Razorpay checkout process
  const handleCheckoutPayment = async () => {
    setError('');
    try {
      // 1. Acquire slot lock
      const lockRes = await fetch('/api/bookings/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom!.id,
          date,
          startTime,
          durationHours,
        }),
      });

      const lockResult = await lockRes.json();
      if (!lockRes.ok) {
        setError(lockResult.error || 'Failed to hold time slot. It may have been booked by someone else.');
        return;
      }

      // 2. Create pending order & Razorpay order
      const foodItemsArray = Array.from(preOrderCart.entries()).map(([id, qty]) => ({ id, qty }));
      const createRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom!.id,
          date,
          startTime,
          durationHours,
          guestCount,
          foodItems: foodItemsArray,
        }),
      });

      const createResult = await createRes.json();
      if (!createRes.ok) {
        setError(createResult.error || 'Checkout initialization failed. Please try again.');
        return;
      }

      const checkoutData = createResult.data;

      // 3. Mount Razorpay Checkout modal
      const options = {
        key: checkoutData.keyId,
        amount: checkoutData.amount,
        currency: 'INR',
        name: 'COVE Aizawl',
        description: `${selectedRoom!.name} Room Booking`,
        order_id: checkoutData.razorpayOrderId,
        handler: function (response: any) {
          // Redirect client to confirmation page on successful checkout
          router.push(`/book/confirmation?bookingId=${checkoutData.bookingId}`);
        },
        prefill: {
          name: checkoutData.customerName,
          contact: checkoutData.customerPhone,
          email: checkoutData.customerEmail,
        },
        theme: {
          color: '#4A3428', // Espresso Brand Color
        },
      };

      const rpModal = new window.Razorpay(options);
      rpModal.open();

    } catch (err: any) {
      setError(err.message || 'Payment processor failed to launch.');
    }
  };

  return (
    <div className="stepper-wizard-page">
      {/* Step Indicator Header */}
      <div className="stepper-header">
        <h1 className="stepper-main-title">Book a Private Space</h1>
        <div className="stepper-dots">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`step-dot ${activeStep === s ? 'active' : ''} ${activeStep > s ? 'completed' : ''}`}
            >
              <span className="dot-label">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="stepper-error-banner" role="alert">
          <span className="material-symbols-outlined error-icon">warning</span>
          <p>{error}</p>
        </div>
      )}

      {/* STEP 1: ROOM SELECTION */}
      {activeStep === 1 && (
        <div className="step-content animate-fade">
          <h2 className="step-section-heading">Select Your Room</h2>
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`room-select-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
              >
                <div className="room-card-img-wrapper">
                  <Image
                    src={ROOM_IMAGES[room.slug] || ROOM_IMAGES.husk}
                    alt={room.name}
                    fill
                    className="room-card-image"
                  />
                </div>
                <div className="room-card-body">
                  <h3 className="room-card-title">{room.name}</h3>
                  <div className="room-card-specs">
                    <span>{room.slug === 'husk' ? '1-2 guests max' : `${room.min_pax}-${room.max_pax} guests`}</span>
                    <span>₹{room.price_per_hour}/hr</span>
                  </div>
                  <p className="room-card-description">{room.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: DATE & TIME CONFIG */}
      {activeStep === 2 && (
        <div className="step-content animate-fade">
          <h2 className="step-section-heading">Choose Date & Time</h2>
          <div className="time-select-container">
            {/* Date Picker */}
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input-date"
              />
            </div>

            {/* Time Slot Chips Grid */}
            {date && (
              <div className="form-group">
                <label className="form-label">Available Slots</label>
                {isLoadingSlots ? (
                  <p className="slots-loading">Loading slots...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="slots-empty">No slots available for this date.</p>
                ) : (
                  <div className="time-chips-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setStartTime(slot)}
                        className={`time-chip-btn ${startTime === slot ? 'selected' : ''}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Duration range selector */}
            {startTime && (
              <div className="form-group">
                <div className="duration-header">
                  <label className="form-label">Duration</label>
                  <span className="duration-display">
                    {durationHours} {durationHours === 1 ? 'Hour' : 'Hours'} {calculateEndTimeStr() && `(Ends at ${calculateEndTimeStr()})`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="duration-range-slider"
                />
                <div className="slider-labels">
                  <span>1h</span>
                  <span>5h</span>
                </div>
                {isEndTimePastBoundary() && (
                  <div className="cutoff-warning">
                    ⚠️ Ends after our 11:00 PM closing cutoff. Please select a shorter duration or earlier start.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: GUEST CAPACITIES */}
      {activeStep === 3 && (
        <div className="step-content animate-fade">
          <h2 className="step-section-heading">How many guests are coming?</h2>
          <div className="guest-select-container">
            <p className="room-limit-note">
              Capacity for <strong>{selectedRoom!.name}</strong>: {selectedRoom!.min_pax} to {selectedRoom!.max_pax} guests.
            </p>
            <div className="guest-counter-box">
              <button
                type="button"
                onClick={() => setGuestCount(prev => Math.max(prev - 1, selectedRoom!.min_pax))}
                className="counter-btn"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="counter-value">{guestCount}</span>
              <button
                type="button"
                onClick={() => setGuestCount(prev => Math.min(prev + 1, selectedRoom!.max_pax))}
                className="counter-btn"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: OPTIONAL PRE-ORDERS ACCORDION */}
      {activeStep === 4 && (
        <div className="step-content animate-fade">
          <h2 className="step-section-heading">Pre-order Food & Drinks (Optional)</h2>
          <p className="pre-order-note">Have your café selections freshly served in your room on arrival.</p>
          <div className="pre-order-list">
            {menuItems.length === 0 ? (
              <p className="no-preorders">No items currently available for pre-order.</p>
            ) : (
              menuItems.map((item) => {
                const qty = preOrderCart.get(item.id) || 0;
                return (
                  <div key={item.id} className="pre-order-item-row">
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <span className="item-price">₹{item.price}</span>
                      <p className="item-description">{item.description}</p>
                    </div>
                    <div className="item-counter">
                      {qty > 0 ? (
                        <div className="active-counter">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, false)}
                            className="counter-mini-btn"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="counter-mini-val">{qty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.id, true)}
                            className="counter-mini-btn"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.id, true)}
                          className="btn-add-item"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* STEP 5: RESERVATION REVIEW & PAYMENT */}
      {activeStep === 5 && (
        <div className="step-content animate-fade">
          <h2 className="step-section-heading">Review & Checkout</h2>
          <div className="review-container">
            {/* Specs Summary */}
            <div className="review-block">
              <h3 className="review-title">Reservation Details</h3>
              <div className="review-grid">
                <div className="review-item-col">
                  <span className="review-label">Space</span>
                  <span className="review-val">{selectedRoom!.name} ({selectedRoom!.slug === 'husk' ? 'Couple Room' : 'Group Room'})</span>
                </div>
                <div className="review-item-col">
                  <span className="review-label">Date & Time</span>
                  <span className="review-val">{date} at {startTime} ({durationHours}h reservation)</span>
                </div>
                <div className="review-item-col">
                  <span className="review-label">Guests count</span>
                  <span className="review-val">{guestCount} pax</span>
                </div>
              </div>
            </div>

            {/* Food items summary */}
            {preOrderCart.size > 0 && (
              <div className="review-block">
                <h3 className="review-title">Pre-ordered Food & Drinks</h3>
                <div className="review-food-list">
                  {Array.from(preOrderCart.entries()).map(([itemId, qty]) => {
                    const item = menuItems.find(m => m.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} className="review-food-row">
                        <span>{item.name} x {qty}</span>
                        <span>₹{item.price * qty}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ledger totals */}
            <div className="review-block ledger-box">
              <div className="ledger-row">
                <span>Room Rent ({durationHours}h)</span>
                <span>₹{getRoomSubtotal()}</span>
              </div>
              {getFoodSubtotal() > 0 && (
                <div className="ledger-row">
                  <span>Food Pre-orders</span>
                  <span>₹{getFoodSubtotal()}</span>
                </div>
              )}
              <div className="ledger-row">
                <span>Convenience Fees (5% flat)</span>
                <span>₹{getConvenienceFees()}</span>
              </div>
              <div className="ledger-row grand-total">
                <span>Grand Total</span>
                <span>₹{getGrandTotal()}</span>
              </div>
            </div>

            {/* Checkout button */}
            <button
              type="button"
              onClick={handleCheckoutPayment}
              className="btn-stepper-payment-cta"
            >
              Confirm & Pay ₹{getGrandTotal()}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons footer */}
      <div className="stepper-nav-footer">
        {activeStep > 1 && (
          <button
            type="button"
            onClick={handleBackStep}
            className="btn-stepper-nav back"
          >
            Back
          </button>
        )}
        {activeStep < 5 && (
          <button
            type="button"
            onClick={handleNextStep}
            className="btn-stepper-nav next"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
