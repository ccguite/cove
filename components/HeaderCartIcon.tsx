'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeaderCartIcon() {
  const [cartCount, setCartCount] = useState<number>(0);

  const updateCount = () => {
    try {
      const cartData = localStorage.getItem('cove-cafe-cart');
      if (cartData) {
        const items = JSON.parse(cartData);
        if (Array.isArray(items)) {
          const total = items.reduce((sum, item) => sum + (item.qty || 0), 0);
          setCartCount(total);
          return;
        }
      }
      setCartCount(0);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCount();
    window.addEventListener('cove-cart-update', updateCount);
    return () => {
      window.removeEventListener('cove-cart-update', updateCount);
    };
  }, []);

  return (
    <Link href="/cart" className="nav-cart-btn" aria-label={`View Cart, ${cartCount} items`}>
      <span className="material-symbols-outlined">shopping_bag</span>
      {cartCount > 0 && (
        <span className="cart-badge-count">{cartCount}</span>
      )}
    </Link>
  );
}
