# COVE — Project Overview

## What Is COVE?

COVE is a premium Korean-inspired café and entertainment lounge located in Aizawl, Mizoram, India. Its website serves as both a marketing platform and a transactional system. Customers can discover COVE's offerings — specialty coffee, curated food, two private experience rooms, a cat café, a pool table, and a photobooth — and take direct action by booking a private room, pre-ordering food alongside a room booking, or placing a standalone food order for takeaway or delivery. The site is designed with a warm, intimate, brown-and-cream aesthetic inspired by Korean café culture, built to attract and convert Mizo customers through an Instagram-worthy, photography-forward experience.

---

## Goals

1. Establish COVE's brand identity online with a premium, Korean-inspired visual design that resonates with young adults and families in Aizawl.
2. Allow customers to browse and book one of two private rooms (Husk or Haven) by selecting a date, start time, and duration, with real-time slot availability.
3. Allow customers to pre-order food items from the full menu when making a room booking, so their order is ready on arrival.
4. Allow customers to place standalone food orders for takeaway or delivery, with delivery restricted to a 5km radius from COVE's location.
5. Process all payments — room bookings and food orders — securely online via Razorpay (UPI, debit card, net banking) with full payment required upfront.
6. Authenticate customers using a phone number OTP system, automatically creating an account on first use with no separate sign-up step required.
7. Provide a single internal dashboard for COVE staff and admins with role-based access to manage orders, bookings, and menu content in real time.
8. Give admin users full control over the menu, including adding seasonal items, marking items as sold out, and removing discontinued items.

---

## Core User Flow (Start to Finish)

The following describes the end-to-end journey for a customer booking a room with a food pre-order, which is the most complete flow on the platform.

1. **Customer visits the COVE website** and lands on the homepage, which showcases the café's ambience, key features, and a call to action to book or order.
2. **Customer browses the Rooms page** and reads about Husk (Couple Room, max 2 pax, ₹599/hr) and Haven (Group Room, 3–8 pax, ₹1,499/hr).
3. **Customer selects a room** and is shown a date picker. They choose a date, a start time (from fixed hourly slots between 10AM and 10PM), and a duration (1 to 5 hours). The system enforces that the booking must end by 11PM.
4. **Customer enters the number of guests.** The system validates against the room's capacity rules (e.g., Haven requires at least 3 guests).
5. **Customer optionally browses the food menu** and adds items to their booking as a pre-order.
6. **Customer is prompted to log in.** They enter their phone number, receive an OTP via SMS, and verify it. If this is their first time, an account is automatically created.
7. **Customer sees the order summary:** room name, date, time slot, duration, number of guests, pre-ordered food items, and total amount.
8. **Customer proceeds to payment** via Razorpay and completes the transaction using UPI, debit card, or net banking.
9. **Booking is confirmed.** Customer receives an SMS confirmation with booking details. The booking appears in their account history.
10. **Staff dashboard updates in real time.** The new booking and pre-ordered food items appear immediately on the staff dashboard with a notification alert.
11. **Staff prepares the food order** before the customer's arrival and marks it as ready through the dashboard.

---

## Features by Category

### Marketing & Discovery
- Homepage with hero section, ambience photography, and call-to-action buttons for booking and ordering.
- Rooms page with detailed descriptions, photos, pricing, and capacity information for Husk and Haven.
- Menu page displaying all food and drink categories with item names, descriptions, prices, and sold-out states.
- Informational sections for Cat Café, Pool Table, and Photobooth — including photos, descriptions, and walk-in details.
- SEO-optimised pages with proper meta titles, descriptions, and structured headings for discoverability in Aizawl searches.

### Room Booking
- Two bookable rooms: Husk (Couple Room) and Haven (Group Room).
- Fixed hourly time slots from 10AM to 10PM (last slot start time), operating hours 10AM–11PM.
- Duration selection from 1 to 5 hours, with the system blocking any booking that would extend past 11PM.
- Real-time slot availability display — booked slots are shown as unavailable instantly.
- Slot-locking mechanism that temporarily reserves a slot during checkout to prevent double-booking.
- Guest count input with per-room validation (Husk: max 2; Haven: min 3, max 8).
- Food pre-order option embedded within the booking flow.
- Full upfront payment via Razorpay. No cancellations.

### Food Ordering
- Standalone food ordering flow separate from room bookings.
- Two order types: **Takeaway** (customer collects from COVE) and **Delivery** (COVE's own riders).
- Delivery restricted to addresses within 5km of COVE's location. Addresses outside this radius are blocked before payment.
- Minimum order value of ₹299 for delivery orders.
- Full upfront payment via Razorpay for all orders.

### Menu Management
- Food categories: Cakes & Pastries, Croffles, Sandwiches, Fries, Burgers, Snacks.
- Drink categories: Hot Coffees, Cold Coffees, Shakes, Iced Tea, Signature Drinks.
- No item customisations (no size or add-on variants).
- Admin can add new items, edit existing items, mark items as sold out (visible but unorderable), and delete items.
- Admin can add and remove seasonal items at any time.

### Authentication
- Phone number OTP login as the primary method. Email OTP as a fallback.
- Account auto-created on first successful OTP verification — no separate registration step.
- Logged-in customers can view their booking history and food order history.

### Internal Dashboard
- Single dashboard for all internal users, with two roles: **Admin** and **Staff**.
- **Staff access:** View today's bookings, view all active food orders, update order status (Preparing → Ready → Out for Delivery / Ready for Pickup), receive real-time audio and visual notifications on new orders.
- **Admin access:** All staff capabilities, plus full menu management, manual room slot blocking/unblocking, revenue and order reports, staff account creation and role assignment.

---

## In Scope

- Public-facing marketing website (homepage, rooms, menu, features pages).
- Room booking system for Husk and Haven with fixed hourly slots, duration selection, guest count validation, and overlap prevention.
- Food pre-order functionality embedded in the room booking flow.
- Standalone food ordering for takeaway and delivery with a 5km delivery radius block.
- Razorpay payment integration (UPI, debit card, net banking) in test/mock mode during build.
- Phone OTP authentication via Supabase (test mode during build; live SMS deferred).
- Customer account with booking and order history.
- Internal dashboard with Admin and Staff roles and real-time order notifications.
- Admin menu management (add, edit, mark sold out, remove items and seasonal specials).
- Supabase as the backend (PostgreSQL database, Auth, File Storage for images, Realtime subscriptions).
- Next.js frontend deployed on Vercel.
- Korean-inspired warm design system (brown, cream, amber palette; Playfair Display + Inter typography).

---

## Out of Scope

- Food bundle or combo deals combining room bookings and discounted food items (deferred to v2).
- Cancellation and refund workflows (policy not yet defined).
- Customer loyalty or points system.
- Third-party delivery platform integration (Swiggy, Zomato, Dunzo).
- In-venue QR code ordering with a live kitchen display system.
- Booking flows for Cat Café, Pool Table, or Photobooth (walk-in only for v1).
- Mobile application (iOS or Android).
- Delivery radius configuration UI in the admin panel (5km is hardcoded for v1).
- Peak and off-peak pricing.
- Google Maps API integration for geocoded address validation (delivery radius check deferred).
- Live Razorpay payments (requires active merchant account; test mode used during build).
- Live SMS OTP delivery via Twilio or MSG91 (deferred; Supabase test mode used during build).

---

## Success Criteria

The v1 build is considered complete and successful when all of the following are true:

1. **Booking flow works end-to-end:** A customer can select a room, choose a date and valid time slot, enter a guest count, add food items, log in via OTP, and complete payment — with the confirmed booking appearing in their account history.
2. **Slot conflict prevention works:** Attempting to book a room for an already-booked time slot shows the slot as unavailable and prevents double-booking.
3. **Booking boundary rules are enforced:** A booking that would end after 11PM is rejected. Haven bookings with fewer than 3 guests are rejected. Husk bookings with more than 2 guests are rejected.
4. **Food ordering works end-to-end:** A customer can add items to a cart, select takeaway or delivery, log in, and complete payment — with the order appearing in the staff dashboard immediately.
5. **Delivery radius block works:** An address more than 5km from COVE is blocked before the payment page is reached. An address within 5km proceeds to checkout.
6. **Minimum order enforced:** A delivery order below ₹299 cannot be submitted.
7. **Real-time dashboard notifications work:** When a new food order or booking is placed, the staff dashboard receives an audio and visual notification without requiring a page refresh.
8. **Admin can manage the menu:** Admin can add a new item, mark an existing item as sold out (it appears greyed-out to customers), and delete an item — all changes reflected on the public menu immediately.
9. **Role-based access is enforced:** A staff account cannot access admin-only features (menu management, revenue reports, staff account creation).
10. **The site is SEO-ready:** Each public page has a unique title tag and meta description, uses a single `<h1>`, and uses semantic HTML throughout.
11. **The design matches the brief:** The site uses the warm Korean-inspired palette (brown, cream, amber), premium typography, and smooth micro-animations that make a strong first impression on Mizo customers.
