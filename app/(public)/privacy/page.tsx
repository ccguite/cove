import React from 'react';
import type { Metadata } from 'next';
import './page.css';

export const metadata: Metadata = {
  title: 'Privacy Policy — COVE',
  description: 'Privacy Policy and data guidelines for COVE Café & Lounge.',
};

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <h1 className="privacy-title">Privacy Policy</h1>

      <div className="privacy-content">
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when registering an account, booking a private room, ordering food, or contacting our team. This includes your name, email address, phone number, and transaction logs.</p>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information to process reservations, fulfill café orders, manage account credentials, send service updates, and ensure compliance with our platform policies.</p>
        </section>

        <section>
          <h2>3. Data Security & Storage</h2>
          <p>We implement secure cryptographic measures and session controls powered by Supabase to protect your personal information against unauthorized access, modification, or disclosure.</p>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>Our payment checkouts utilize Razorpay to securely authorize transactions. We do not store credit card credentials directly on our databases.</p>
        </section>

        <section>
          <h2>5. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, contact us at <strong>contactcoveteam@gmail.com</strong>.</p>
        </section>
      </div>

      <div className="privacy-footer">
        <p className="privacy-updated">Last updated on: June 2026</p>
      </div>
    </div>
  );
}
