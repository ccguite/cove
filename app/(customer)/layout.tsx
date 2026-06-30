import React from 'react';
import HeaderNav from '@/components/HeaderNav';
import MobileBottomNav from '@/components/MobileBottomNav';
import Link from 'next/link';
import '../(public)/layout.css';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="public-shell">
      {/* Dynamic Header (Desktop & Mobile Top) */}
      <HeaderNav />

      {/* Main Page Canvas */}
      <main className="public-main">{children}</main>

      {/* Dynamic Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand-section">
            <span className="footer-logo">COVE</span>
            <p className="footer-address">Café & Lounge. Aizawl, Mizoram.</p>
          </div>
          <div className="footer-links-section">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/location" className="footer-link">Contact</Link>
          </div>
          <div className="footer-copyright">
            © {new Date().getFullYear()} COVE Cafe & Lounge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
