import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Book a Private Lounge Room — COVE',
  description: 'Reserve a premium, private experience room (Husk couple lounge or Haven group lounge) at COVE in Aizawl, Mizoram. Choose your duration, date, guest count, and pre-order food & drinks.',
  openGraph: {
    title: 'Book a Private Lounge Room — COVE',
    description: 'Reserve a premium, private experience room (Husk couple lounge or Haven group lounge) at COVE in Aizawl, Mizoram. Choose your duration, date, guest count, and pre-order food & drinks.',
    images: [
      {
        url: '/images/og-book.jpg',
        width: 1200,
        height: 630,
        alt: 'Book COVE Private Lounge',
      },
    ],
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
