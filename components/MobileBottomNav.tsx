'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Bottom Navigation">
      <Link href="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
        <span className={`material-symbols-outlined ${isActive('/') ? 'icon-fill' : ''}`}>home</span>
        <span className="bottom-nav-label">Home</span>
      </Link>
      <Link href="/rooms" className={`bottom-nav-item ${isActive('/rooms') ? 'active' : ''}`}>
        <span className={`material-symbols-outlined ${isActive('/rooms') ? 'icon-fill' : ''}`}>grid_view</span>
        <span className="bottom-nav-label">Rooms</span>
      </Link>
      <Link href="/menu" className={`bottom-nav-item ${isActive('/menu') ? 'active' : ''}`}>
        <span className={`material-symbols-outlined ${isActive('/menu') ? 'icon-fill' : ''}`}>restaurant_menu</span>
        <span className="bottom-nav-label">Cafe</span>
      </Link>
      <Link href="/book" className={`bottom-nav-item ${isActive('/book') ? 'active' : ''}`}>
        <span className={`material-symbols-outlined ${isActive('/book') ? 'icon-fill' : ''}`}>calendar_month</span>
        <span className="bottom-nav-label">Book</span>
      </Link>
    </nav>
  );
}
