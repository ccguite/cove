'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import type { MenuItem, MenuCategory } from '@/lib/supabase/types';

interface MenuPageClientProps {
  categories: MenuCategory[];
  items: MenuItem[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function MenuPageClient({ categories, items }: MenuPageClientProps) {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Initialize selected category from URL search params
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    setSelectedCategory(cat);
  }, [searchParams]);

  // Scroll fade-in: add .visible class when category block enters viewport
  useEffect(() => {
    const blocks = document.querySelectorAll('.menu-category-block');
    if (!blocks.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    blocks.forEach((block) => observer.observe(block));
    return () => observer.disconnect();
  // Re-run when items change (filter applied)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Load cart state from localStorage on mount
  useEffect(() => {
    try {
      const cartData = localStorage.getItem('cove-cafe-cart');
      if (cartData) {
        setCart(JSON.parse(cartData) || []);
      }
    } catch {}
  }, []);

  const selectCategory = (catName: string) => {
    setSelectedCategory(catName);
    const url = catName ? `/menu?category=${encodeURIComponent(catName)}` : '/menu';
    window.history.pushState({}, '', url);
  };

  const addToCart = (item: MenuItem) => {
    const newCart = [...cart];
    const existing = newCart.find((i) => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      newCart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    }
    setCart(newCart);
    localStorage.setItem('cove-cafe-cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cove-cart-update'));
  };

  const updateQty = (itemId: string, increment: boolean) => {
    const newCart = [...cart];
    const existingIndex = newCart.findIndex((i) => i.id === itemId);
    if (existingIndex !== -1) {
      if (increment) {
        newCart[existingIndex].qty += 1;
      } else {
        if (newCart[existingIndex].qty <= 1) {
          newCart.splice(existingIndex, 1);
        } else {
          newCart[existingIndex].qty -= 1;
        }
      }
    }
    setCart(newCart);
    localStorage.setItem('cove-cafe-cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cove-cart-update'));
  };

  // Filter items based on selected category (Memoized)
  const filteredItems = useMemo(() => {
    return selectedCategory
      ? items.filter((item) => {
          const cat = categories.find((c) => c.name === selectedCategory);
          return cat ? item.category_id === cat.id : true;
        })
      : items;
  }, [selectedCategory, items, categories]);

  // Group items by category for rendering sections (Memoized)
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    categories.forEach((cat) => {
      const catItems = filteredItems.filter((i) => i.category_id === cat.id);
      if (catItems.length > 0) {
        grouped[cat.name] = catItems;
      }
    });
    return grouped;
  }, [categories, filteredItems]);

  return (
    <div className="cafe-menu-page">
      {/* Cafe Hero Section */}
      <section className="cafe-hero">
        <div className="cafe-header">
          <h1 className="cafe-title">COVE Café</h1>
          <p className="cafe-subtitle">
            Sip and bite into curated specialty coffees, Mizo honey lattes, and fresh croffles styled after Seoul's finest minimalist cafés.
          </p>
        </div>
      </section>

      {/* Horizontal Category Navigation */}
      <nav className="horizontal-category-nav" aria-label="Menu categories">
        <button
          type="button"
          onClick={() => selectCategory('')}
          className={`category-pill-btn ${!selectedCategory ? 'active' : ''}`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => selectCategory(cat.name)}
            className={`category-pill-btn ${selectedCategory === cat.name ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Menu Cards Grid */}
      <section className="menu-grid-section">
        {Object.keys(itemsByCategory).length === 0 ? (
          <div className="menu-empty-state">
            <p className="menu-empty-text">No menu items available</p>
          </div>
        ) : (
          Object.entries(itemsByCategory).map(([catName, catItems]) => (
            <div key={catName} className="menu-category-block">
              <h2 className="menu-category-title">{catName}</h2>
              <div className="product-grid">
                {catItems.map((item) => {
                  const cartItem = cart.find((i) => i.id === item.id);
                  const qty = cartItem ? cartItem.qty : 0;
                  
                  return (
                    <article
                      key={item.id}
                      className={`product-card ${!item.is_available ? 'sold-out' : ''}`}
                    >
                      {/* Sold out overlay */}
                      {!item.is_available && (
                        <div className="sold-out-overlay">
                          <span className="sold-out-badge">Sold Out</span>
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="product-image-container">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="product-image"
                          />
                        ) : (
                          <div className="image-placeholder">
                            <span className="material-symbols-outlined image-placeholder-icon">restaurant</span>
                            Photo coming soon
                          </div>
                        )}
                        
                        {/* Seasonal badge */}
                        {item.is_seasonal && (
                          <span className="seasonal-badge">Seasonal</span>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="product-card-body">
                        <div className="product-header">
                          <span className="product-category-label">
                            {categories.find((c) => c.id === item.category_id)?.name || ''}
                          </span>
                          <h3 className="product-title">{item.name}</h3>
                          <span className="product-price">₹{item.price}</span>
                        </div>
                        
                        {/* Action buttons / Quantity controls */}
                        <div className="card-action-bar">
                          {item.is_available ? (
                            qty > 0 ? (
                              <div className="card-qty-controls">
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, false)}
                                  className="btn-qty-adjust"
                                  aria-label="Decrease quantity"
                                >
                                  <span className="material-symbols-outlined">remove</span>
                                </button>
                                <span className="qty-value">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, true)}
                                  className="btn-qty-adjust"
                                  aria-label="Increase quantity"
                                >
                                  <span className="material-symbols-outlined">add</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => addToCart(item)}
                                className="btn-add-to-cart"
                              >
                                <span className="material-symbols-outlined">add_shopping_cart</span>
                                Add to Cart
                              </button>
                            )
                          ) : (
                            <button type="button" className="btn-add-to-cart disabled" disabled>
                              Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>
      {/* Delivery Distance Details / Footnote */}
      <footer className="menu-delivery-info">
        <div className="delivery-info-container">
          <span className="material-symbols-outlined delivery-info-icon">local_shipping</span>
          <h3 className="delivery-info-title">
            Café Delivery Information
          </h3>
          <p className="delivery-info-desc">
            We offer delivery of our full menu (Hot Coffees, Signature Drinks, Sandwiches, and Pastries) directly to your doorstep.
          </p>
          <div className="delivery-info-pills">
            <span className="delivery-pill">5KM Radius Max</span>
            <span className="delivery-pill">₹299 Min Order</span>
          </div>
          <p className="delivery-info-footnote">
            *Radius check enforces delivery coordinates strictly within 5km from COVE during checkout.
          </p>
        </div>
      </footer>
    </div>
  );
}
