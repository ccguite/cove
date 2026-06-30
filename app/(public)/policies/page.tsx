import React from 'react';
import type { Metadata } from 'next';
import './page.css';

export const metadata: Metadata = {
  title: 'Booking & Refund Policies — COVE',
  description: 'Room booking policies, refund guidelines, and guest rules for COVE Café & Lounge.',
};

export default function PoliciesPage() {
  return (
    <div className="policies-page">
      <h1 className="policies-title">Booking &amp; Refund Policies</h1>

      <div className="policies-content">
        <section>
          <h2>1. Room Booking Policy</h2>
          <p>
            COVE offers two private experience rooms: <strong>Husk</strong> (designed for couples/individuals, maximum capacity of 2 guests) and <strong>Movietopia</strong> (designed for groups, capacity of 3 to 8 guests).
          </p>
          <p>
            Bookings are structured in fixed hourly slots between 10:00 AM and 11:00 PM daily. The last time slot of the day starts at 10:00 PM. Bookings must be reserved online in advance.
          </p>
        </section>

        <section>
          <h2>2. Guest Count &amp; Capacity Rules</h2>
          <ul>
            <li><strong>Husk Room</strong>: Enforces a strict maximum of 2 guests. Over-occupancy is not permitted.</li>
            <li><strong>Movietopia Room</strong>: Requires a minimum of 3 guests and accommodates a maximum of 8 guests. Bookings failing to meet the minimum capacity rule will be rejected.</li>
          </ul>
        </section>

        <section>
          <h2>3. Refund &amp; Cancellation Policy</h2>
          <p>
            All bookings and café pre-orders are final and require full upfront payment via Razorpay.
          </p>
          <p>
            We enforce a <strong>strict no-refund and no-cancellation policy</strong>. Once a slot is reserved or food is pre-ordered, it cannot be canceled, refunded, or rescheduled. Please verify your selected date, time slot, and guest count carefully before completing payment.
          </p>
        </section>

        <section>
          <h2>4. Café Pre-Orders</h2>
          <p>
            When making a room reservation, you may optionally pre-order food and drinks. Pre-orders are prepared in advance to be ready upon your arrival. Because ingredients are prepared immediately upon order confirmation, food pre-orders cannot be modified or canceled.
          </p>
        </section>

        <section>
          <h2>5. House Rules &amp; Guidelines</h2>
          <ul>
            <li><strong>No Outside Food/Drinks</strong>: Outside food, snacks, or beverages are strictly prohibited anywhere inside the café, lounge, or private experience rooms.</li>
            <li><strong>Punctuality</strong>: Please arrive 10 minutes prior to your scheduled booking start time. Slots cannot be shifted or extended past your booked duration if you arrive late.</li>
            <li><strong>Damage Liability</strong>: Guests are responsible for any damage caused to equipment (screen, consoles, furniture, pool table, photobooth, etc.) during their stay and will be billed for repairs or replacements.</li>
            <li><strong>Extension requests</strong>: Extensions are subject to slot availability and must be booked and paid for online before your current slot expires.</li>
          </ul>
        </section>
      </div>

      <div className="policies-footer">
        <p className="policies-updated">Last updated on: June 2026</p>
      </div>
    </div>
  );
}
