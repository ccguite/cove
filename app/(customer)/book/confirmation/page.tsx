import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/serverClient';
import type { Booking, Room, BookingFoodItem, MenuItem } from '@/lib/supabase/types';
import './page.css';

interface ConfirmationPageProps {
  searchParams: Promise<{ bookingId?: string }>;
}

type FoodItemDetail = BookingFoodItem & {
  menu_items: {
    name: string;
  } | null;
};

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const resolvedSearchParams = await searchParams;
  const bookingId = resolvedSearchParams.bookingId;

  if (!bookingId) {
    redirect('/');
  }

  const supabase = createSupabaseServerClient();

  // Fetch booking with room join details
  const { data: bookingData, error: bookingErr } = await supabase
    .from('bookings')
    .select('*, rooms(*)')
    .eq('id', bookingId)
    .single();

  if (bookingErr || !bookingData) {
    // If no booking found, redirect home
    redirect('/');
  }

  const booking = bookingData as Booking & { rooms: Room };

  // Fetch pre-ordered food items
  const { data: foodData } = await supabase
    .from('booking_food_items')
    .select('*, menu_items(name)')
    .eq('booking_id', bookingId);

  const foodItems = (foodData || []) as FoodItemDetail[];

  return (
    <div className="confirmation-page-container">
      {/* Success Banner */}
      <div className="success-banner-box">
        <span className="material-symbols-outlined success-check-icon">check_circle</span>
        <h1 className="success-title-main">Booking Confirmed!</h1>
        <p className="success-description-text">
          Thank you for choosing COVE. Your private space is successfully reserved and paid. 
          A summary has been generated for your record.
        </p>
      </div>

      {/* Booking Details Pane */}
      <div className="summary-ledger-card">
        <div className="summary-header">
          <h2 className="summary-section-title">Reservation Details</h2>
          <span className="summary-booking-id">ID: {booking.id.substring(0, 8).toUpperCase()}</span>
        </div>

        <div className="summary-detail-grid">
          <div className="summary-item-col">
            <span className="summary-item-label">Reserved Space</span>
            <span className="summary-item-val">{booking.rooms.name} Room</span>
          </div>
          <div className="summary-item-col">
            <span className="summary-item-label">Date & Time</span>
            <span className="summary-item-val">{booking.date} at {booking.start_time.substring(0, 5)}</span>
          </div>
          <div className="summary-item-col">
            <span className="summary-item-label">Duration</span>
            <span className="summary-item-val">{booking.duration_hours} {booking.duration_hours === 1 ? 'Hour' : 'Hours'}</span>
          </div>
          <div className="summary-item-col">
            <span className="summary-item-label">Guests Count</span>
            <span className="summary-item-val">{booking.guest_count} guests</span>
          </div>
        </div>

        {/* Pre-orders list */}
        {foodItems.length > 0 && (
          <div className="summary-section-block">
            <h3 className="summary-sub-title">Pre-ordered Food & Drinks</h3>
            <div className="confirmation-food-list">
              {foodItems.map((item) => (
                <div key={item.id} className="food-item-row-confirm">
                  <span>{item.menu_items?.name || 'Cafe Item'} x {item.quantity}</span>
                  <span>₹{item.unit_price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Price paid */}
        <div className="summary-section-block price-box-ledger">
          <div className="price-ledger-row">
            <span>Total Paid (incl. fees & taxes)</span>
            <span className="confirm-total-price">₹{booking.total_price}</span>
          </div>
        </div>
      </div>

      {/* Button navigations */}
      <div className="confirmation-action-buttons">
        <Link href="/account" className="btn-confirm-action primary">
          View Booking History
        </Link>
        <Link href="/" className="btn-confirm-action secondary">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
