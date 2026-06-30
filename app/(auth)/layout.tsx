import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In / Sign Up — COVE',
  description: 'Access your COVE account to manage your private lounge room bookings, pre-ordered food items, and standalone delivery or takeaway orders.',
  openGraph: {
    title: 'Sign In / Sign Up — COVE',
    description: 'Access your COVE account to manage your private lounge room bookings, pre-ordered food items, and standalone delivery or takeaway orders.',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}
